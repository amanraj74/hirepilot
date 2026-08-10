'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/server/auth/rbac';
import { applyToJob, ApplicationError } from '@/server/services/applications.service';
import { applySchema } from '@/lib/validations/applications';

export type ApplyState =
  | { ok: true; applicationId: string }
  | { ok: false; error: string }
  | undefined;

export async function applyToJobAction(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const user = await requireAuth();

  // Only candidates can apply (recruitors/etc shouldn't be blocked if they want
  // to test the flow with a candidate account).
  if (user.role !== 'CANDIDATE') {
    return { ok: false, error: 'Only candidate accounts can submit applications.' };
  }

  const parsed = applySchema.safeParse({
    jobId: formData.get('jobId'),
    coverLetter: formData.get('coverLetter'),
  });
  if (!parsed.success) {
    const firstFieldError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return { ok: false, error: firstFieldError ?? 'Please fill in all required fields.' };
  }

  try {
    const application = await applyToJob({
      jobId: parsed.data.jobId,
      candidateId: user.id,
      candidateName: user.name,
      candidateEmail: user.email,
      coverLetter: parsed.data.coverLetter,
    });
    revalidatePath('/applications');
    revalidatePath('/recruiter/pipeline');
    revalidatePath(`/jobs/${parsed.data.jobId}`);
    redirect('/applications?applied=' + application.id);
  } catch (err) {
    if (err instanceof ApplicationError) return { ok: false, error: err.message };
    throw err;
  }
}
