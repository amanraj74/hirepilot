'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth/rbac';
import { duplicateJob, softDeleteJob } from '@/server/services/jobs.service';

export async function duplicateJobAction(jobId: string) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const job = await duplicateJob(jobId, { userId: user.id, companyId: user.companyId });
  revalidatePath('/recruiter/dashboard');
  redirect(`/recruiter/jobs/${job.id}`);
}

export async function deleteJobAction(jobId: string) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  await softDeleteJob(jobId, { userId: user.id, companyId: user.companyId });
  revalidatePath('/recruiter/dashboard');
  redirect('/recruiter/dashboard');
}
