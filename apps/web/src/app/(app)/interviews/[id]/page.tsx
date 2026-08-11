import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, CalendarClock, ExternalLink, MapPin, Star, Users, Video } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { prisma } from '@/server/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils/format';
import { FeedbackForm } from './_components/feedback-form';

export const metadata: Metadata = { title: 'Interview · HirePilot' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TYPE_LABEL: Record<string, string> = {
  PHONE: 'Phone',
  TECHNICAL: 'Technical',
  HR: 'HR',
  PANEL: 'Panel',
  ONSITE: 'Onsite',
};

const REC_LABEL: Record<string, string> = {
  STRONG_HIRE: 'Strong hire',
  HIRE: 'Hire',
  NO_HIRE: 'No hire',
  STRONG_NO_HIRE: 'Strong no hire',
};

const REC_COLOR: Record<string, string> = {
  STRONG_HIRE: 'bg-green-500/15 text-green-700 dark:text-green-400',
  HIRE: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  NO_HIRE: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  STRONG_NO_HIRE: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?callbackUrl=/recruiter/interviews/${id}`);

  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      application: {
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true, company: { select: { name: true } } } },
        },
      },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      },
      feedback: { include: { interviewer: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!interview) notFound();

  const isInterviewer =
    interview.participants.some((p) => p.userId === session.user.id) ||
    session.user.role === 'ADMIN';
  const isRecruiter =
    interview.application.job.id &&
    (
      await prisma.job.findUnique({
        where: { id: interview.application.job.id },
        select: { postedById: true, companyId: true },
      })
    )?.postedById === session.user.id;

  if (!isInterviewer && !isRecruiter) {
    redirect('/dashboard');
  }

  const myFeedback = interview.feedback.find((f) => f.interviewerId === session.user.id);
  const interviewers = interview.participants.map((p) => ({
    id: p.user.id,
    name: p.user.name ?? p.user.email.split('@')[0],
    email: p.user.email,
    role: p.user.role,
  }));
  const candidateName =
    interview.application.candidate.name ??
    interview.application.candidate.email.split('@')[0] ??
    'Candidate';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/recruiter/interviews"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to interviews
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {TYPE_LABEL[interview.type] ?? interview.type} with {candidateName}
          </h1>
          <Badge variant={interview.status === 'COMPLETED' ? 'secondary' : 'default'}>
            {interview.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {interview.application.job.title}
          {interview.application.job.company ? ` · ${interview.application.job.company.name}` : ''}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {interview.scheduledAt.toLocaleString()} · {interview.durationMins} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video className="h-4 w-4" aria-hidden="true" />
            {interview.platform.replace('_', ' ')}
          </span>
          {interview.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {interview.location}
            </span>
          )}
        </div>
        {interview.meetingLink && (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Join meeting
          </a>
        )}
      </header>

      {interview.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm text-foreground/90">{interview.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" aria-hidden="true" />
            Interviewers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {interviewers.map((i) => (
              <li key={i.id} className="flex items-center justify-between">
                <span>
                  {i.name}{' '}
                  <span className="text-xs text-muted-foreground">
                    ({i.role.toLowerCase().replace('_', ' ')})
                  </span>
                </span>
                {interview.feedback.find((f) => f.interviewerId === i.id) && (
                  <Badge variant="secondary" className="text-xs">
                    Feedback in
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {interview.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" aria-hidden="true" />
              Submitted feedback ({interview.feedback.length}/{interviewers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interview.feedback.map((f) => (
              <div key={f.id} className="rounded-lg border border-border p-4 text-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">{f.interviewer.name ?? f.interviewer.email}</span>
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                      f.recommendation ? (REC_COLOR[f.recommendation] ?? 'bg-muted') : 'bg-muted'
                    }`}
                  >
                    {f.recommendation
                      ? (REC_LABEL[f.recommendation] ?? f.recommendation)
                      : 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Technical: <b className="text-foreground">{f.technicalSkills}/5</b>
                  </span>
                  <span>
                    Communication: <b className="text-foreground">{f.communication}/5</b>
                  </span>
                  <span>
                    Problem solving: <b className="text-foreground">{f.problemSolving}/5</b>
                  </span>
                  <span>
                    Teamwork: <b className="text-foreground">{f.teamwork}/5</b>
                  </span>
                  <span>
                    Leadership: <b className="text-foreground">{f.leadership}/5</b>
                  </span>
                  <span>
                    Overall: <b className="text-foreground">{f.overallRating}/5</b>
                  </span>
                </div>
                {f.comments && (
                  <p className="mt-2 whitespace-pre-line text-foreground/80">{f.comments}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {formatRelativeTime(f.submittedAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isInterviewer && !myFeedback && interview.status !== 'CANCELLED' && (
        <FeedbackForm interviewId={interview.id} candidateName={candidateName} />
      )}

      {myFeedback && (
        <div className="rounded-md border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          You&rsquo;ve already submitted feedback for this interview. Thanks!
        </div>
      )}

      <div className="flex items-center justify-end">
        <Button asChild variant="outline">
          <Link href={`/jobs/${interview.application.job.id}`}>View job</Link>
        </Button>
      </div>
    </div>
  );
}
