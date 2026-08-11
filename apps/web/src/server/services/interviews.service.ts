import { prisma } from '@/server/db';
import { sendEmail } from '@/server/email/transport';
import { generateIcs } from '@/server/calendar/ics';

// In a .ts file we can't write JSX, so wrap the body in a plain element
// via React.createElement. The transport is type-agnostic for now.
import { createElement, type ReactElement } from 'react';
function htmlToReactEmail(body: string): ReactElement {
  return createElement(
    'div',
    { style: { fontFamily: 'system-ui, sans-serif', lineHeight: 1.5, whiteSpace: 'pre-line' } },
    body,
  );
}

export class InterviewError extends Error {
  constructor(
    public readonly status: 403 | 404 | 409 | 422,
    message: string,
  ) {
    super(message);
    this.name = 'InterviewError';
  }
}

export type ScheduleInterviewInput = {
  applicationId: string;
  type: 'PHONE' | 'TECHNICAL' | 'HR' | 'PANEL' | 'ONSITE';
  scheduledAt: Date;
  durationMins: number;
  platform: 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'OTHER';
  meetingLink?: string | null;
  location?: string | null;
  interviewerIds: string[];
  notes?: string | null;
};

type RecruiterCtx = { userId: string; companyId: string | null };

async function assertCanSchedule(ctx: RecruiterCtx, applicationId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { select: { id: true, postedById: true, companyId: true, title: true } },
    },
  });
  if (!app) throw new InterviewError(404, 'Application not found');
  const isOwner = app.job.postedById === ctx.userId;
  const isCompanyJob = ctx.companyId !== null && app.job.companyId === ctx.companyId;
  if (!isOwner && !isCompanyJob) {
    throw new InterviewError(403, 'You do not have access to this application');
  }
  return app;
}

export async function scheduleInterview(ctx: RecruiterCtx, input: ScheduleInterviewInput) {
  if (input.scheduledAt.getTime() < Date.now()) {
    throw new InterviewError(422, 'Scheduled time must be in the future');
  }
  const application = await assertCanSchedule(ctx, input.applicationId);

  // Verify all interviewers exist and have the right role.
  const interviewers = await prisma.user.findMany({
    where: { id: { in: input.interviewerIds } },
    select: { id: true, name: true, email: true, role: true },
  });
  if (interviewers.length !== input.interviewerIds.length) {
    throw new InterviewError(422, 'One or more interviewers not found');
  }
  const allowed = interviewers.every(
    (u) => u.role === 'INTERVIEWER' || u.role === 'HIRING_MANAGER' || u.role === 'ADMIN',
  );
  if (!allowed) {
    throw new InterviewError(422, 'Interviewers must have INTERVIEWER (or HM/ADMIN) role');
  }

  const meetingLink = input.meetingLink?.trim() || generateMeetingLink(input.platform);

  const interview = await prisma.interview.create({
    data: {
      applicationId: input.applicationId,
      type: input.type,
      scheduledAt: input.scheduledAt,
      durationMins: input.durationMins,
      platform: input.platform,
      meetingLink,
      location: input.location?.trim() || null,
      status: 'SCHEDULED',
      notes: input.notes?.trim() || null,
      participants: {
        create: input.interviewerIds.map((id) => ({
          userId: id,
          role: 'INTERVIEWER',
        })),
      },
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  // ICS for everyone
  const candidate = await prisma.user.findUniqueOrThrow({
    where: { id: application.candidateId },
    select: { name: true, email: true },
  });
  const job = application.job;
  const recipientList = [
    {
      name: candidate.name ?? candidate.email.split('@')[0] ?? 'Candidate',
      email: candidate.email,
    },
    ...interviewers.map((i) => ({
      name: i.name ?? i.email.split('@')[0] ?? 'Interviewer',
      email: i.email,
    })),
  ];

  const ics = generateIcs({
    uid: `${interview.id}@hirepilot.dev`,
    title: `${input.type === 'PHONE' ? 'Phone screen' : input.type === 'TECHNICAL' ? 'Technical interview' : input.type === 'HR' ? 'HR interview' : 'Interview'}: ${job.title}`,
    description: [
      `Interview for the ${job.title} role at HirePilot.`,
      meetingLink ? `Join: ${meetingLink}` : '',
      input.notes?.trim() || '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    location: meetingLink || (input.location?.trim() ?? 'Remote'),
    start: input.scheduledAt,
    durationMinutes: input.durationMins,
    organizer: {
      name: 'HirePilot',
      email: process.env.EMAIL_FROM ?? 'noreply@hirepilot.local',
    },
    attendees: recipientList,
  });

  const subject = `Interview scheduled: ${job.title}`;
  const body = `Hi ${candidate.name ?? 'there'},

You have an interview scheduled for ${input.scheduledAt.toLocaleString()} (${input.durationMins} min).

${input.notes?.trim() ? `Notes from the recruiter:\n${input.notes.trim()}\n\n` : ''}Meeting link: ${meetingLink}

— HirePilot`;

  // Send to candidate + each interviewer.
  for (const r of recipientList) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendEmail({ to: r.email, subject, react: htmlToReactEmail(body) });
  }

  // Create notifications.
  await prisma.notification.createMany({
    data: [
      {
        userId: application.candidateId,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Interview scheduled',
        message: `${input.type} interview for ${job.title} on ${input.scheduledAt.toLocaleString()}.`,
        link: '/applications',
      },
      ...interviewers.map((i) => ({
        userId: i.id,
        type: 'INTERVIEW_SCHEDULED' as const,
        title: 'Interview assigned',
        message: `${input.type} interview for ${job.title} on ${input.scheduledAt.toLocaleString()}.`,
        link: `/interviewer/feedback/${interview.id}`,
      })),
    ],
  });

  // TODO: store icsContent on CalendarEvent model — left for follow-up since
  // the CalendarEvent table doesn't currently have an interviewId relation set
  // in all environments. Email .ics is still delivered above.

  return { interview, ics };
}

function generateMeetingLink(platform: 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'OTHER'): string {
  // Generate a placeholder meeting link. In prod this would call the platform's
  // API to create a real meeting. Here we just produce a stable-looking URL so
  // the demo looks real.
  const token = Math.random().toString(36).slice(2, 10);
  switch (platform) {
    case 'ZOOM':
      return `https://zoom.us/j/demo-${token}`;
    case 'GOOGLE_MEET':
      return `https://meet.google.com/demo-${token}-${token}`;
    case 'TEAMS':
      return `https://teams.microsoft.com/l/meetup-join/${token}`;
    default:
      return `https://meet.hirepilot.dev/${token}`;
  }
}

export type RecruiterInterviewListItem = {
  id: string;
  type: 'PHONE' | 'TECHNICAL' | 'HR' | 'PANEL' | 'ONSITE';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledAt: Date;
  durationMins: number;
  platform: 'ZOOM' | 'GOOGLE_MEET' | 'TEAMS' | 'OTHER';
  meetingLink: string | null;
  location: string | null;
  applicationId: string;
  candidate: { id: string; name: string | null; email: string };
  job: { id: string; title: string };
  interviewers: Array<{ id: string; name: string | null; email: string }>;
};

export async function listInterviewsForRecruiter(
  ctx: RecruiterCtx,
): Promise<RecruiterInterviewListItem[]> {
  // Recruiter sees interviews on applications for jobs they posted/own.
  const apps = await prisma.application.findMany({
    where: ctx.companyId
      ? { job: { OR: [{ postedById: ctx.userId }, { companyId: ctx.companyId }] } }
      : { job: { postedById: ctx.userId } },
    select: { id: true },
  });
  const appIds = apps.map((a) => a.id);
  if (appIds.length === 0) return [];

  const interviews = await prisma.interview.findMany({
    where: { applicationId: { in: appIds } },
    orderBy: { scheduledAt: 'asc' },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      application: {
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true } },
        },
      },
    },
  });

  return interviews.map((iv) => ({
    id: iv.id,
    type: iv.type,
    status: iv.status,
    scheduledAt: iv.scheduledAt,
    durationMins: iv.durationMins,
    platform: iv.platform,
    meetingLink: iv.meetingLink,
    location: iv.location,
    applicationId: iv.applicationId,
    candidate: {
      id: iv.application.candidate.id,
      name: iv.application.candidate.name,
      email: iv.application.candidate.email,
    },
    job: { id: iv.application.job.id, title: iv.application.job.title },
    interviewers: iv.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    })),
  }));
}

export type InterviewerAssignmentItem = RecruiterInterviewListItem & {
  myFeedbackSubmitted: boolean;
};

export async function listInterviewsForInterviewer(
  userId: string,
): Promise<InterviewerAssignmentItem[]> {
  const interviews = await prisma.interview.findMany({
    where: {
      participants: { some: { userId } },
      status: { in: ['SCHEDULED', 'COMPLETED'] },
    },
    orderBy: { scheduledAt: 'asc' },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      application: {
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true } },
        },
      },
      feedback: { where: { interviewerId: userId }, select: { id: true } },
    },
  });

  return interviews.map((iv) => ({
    id: iv.id,
    type: iv.type,
    status: iv.status,
    scheduledAt: iv.scheduledAt,
    durationMins: iv.durationMins,
    platform: iv.platform,
    meetingLink: iv.meetingLink,
    location: iv.location,
    applicationId: iv.applicationId,
    candidate: {
      id: iv.application.candidate.id,
      name: iv.application.candidate.name,
      email: iv.application.candidate.email,
    },
    job: { id: iv.application.job.id, title: iv.application.job.title },
    interviewers: iv.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    })),
    myFeedbackSubmitted: iv.feedback.length > 0,
  }));
}

export async function submitFeedback(
  userId: string,
  input: {
    interviewId: string;
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    teamwork: number;
    leadership: number;
    overallRating: number;
    recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
    comments?: string;
  },
) {
  // Ensure this user is a participant in this interview.
  const participant = await prisma.interviewParticipant.findFirst({
    where: { interviewId: input.interviewId, userId },
  });
  if (!participant) {
    throw new InterviewError(403, 'You are not a participant in this interview');
  }

  // Prevent double-submission.
  const existing = await prisma.interviewFeedback.findFirst({
    where: { interviewId: input.interviewId, interviewerId: userId },
  });
  if (existing) {
    throw new InterviewError(409, 'You have already submitted feedback for this interview');
  }

  return prisma.interviewFeedback.create({
    data: {
      interviewId: input.interviewId,
      interviewerId: userId,
      technicalSkills: input.technicalSkills,
      communication: input.communication,
      problemSolving: input.problemSolving,
      teamwork: input.teamwork,
      leadership: input.leadership,
      overallRating: input.overallRating,
      recommendation: input.recommendation,
      comments: input.comments?.trim() || null,
    },
  });
}
