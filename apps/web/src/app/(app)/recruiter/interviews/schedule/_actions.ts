'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth/rbac';
import { InterviewError, scheduleInterview } from '@/server/services/interviews.service';
import { scheduleInterviewSchema } from '@/lib/validations/interviews';

export type ScheduleInterviewState =
  | { ok: true; interviewId: string }
  | { ok: false; error: string }
  | undefined;

export async function scheduleInterviewAction(
  _prev: ScheduleInterviewState,
  formData: FormData,
): Promise<ScheduleInterviewState> {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);

  const ids = formData.getAll('interviewerIds').map(String).filter(Boolean);
  const meetingLink = String(formData.get('meetingLink') ?? '').trim();

  const parsed = scheduleInterviewSchema.safeParse({
    applicationId: String(formData.get('applicationId') ?? ''),
    type: String(formData.get('type') ?? 'TECHNICAL'),
    scheduledAt: String(formData.get('scheduledAt') ?? ''),
    durationMins: Number(formData.get('durationMins') ?? 60),
    platform: String(formData.get('platform') ?? 'GOOGLE_MEET'),
    meetingLink: meetingLink || undefined,
    location: String(formData.get('location') ?? '').trim() || undefined,
    interviewerIds: ids,
    notes: String(formData.get('notes') ?? '').trim() || undefined,
  });
  if (!parsed.success) {
    const firstFieldError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return { ok: false, error: firstFieldError ?? 'Please check the form fields.' };
  }
  try {
    const { interview } = await scheduleInterview(
      { userId: user.id, companyId: user.companyId },
      {
        applicationId: parsed.data.applicationId,
        type: parsed.data.type,
        scheduledAt: parsed.data.scheduledAt,
        durationMins: parsed.data.durationMins,
        platform: parsed.data.platform,
        meetingLink: parsed.data.meetingLink || null,
        location: parsed.data.location || null,
        interviewerIds: parsed.data.interviewerIds,
        notes: parsed.data.notes || null,
      },
    );
    revalidatePath('/recruiter/interviews');
    revalidatePath('/recruiter/dashboard');
    revalidatePath('/recruiter/pipeline');
    return { ok: true, interviewId: interview.id };
  } catch (err) {
    if (err instanceof InterviewError) return { ok: false, error: err.message };
    throw err;
  }
}
