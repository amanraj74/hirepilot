'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth/rbac';
import { createJob, RecruiterJobError, updateJob } from '@/server/services/jobs.service';
import { createJobSchema, updateJobSchema } from '@/lib/validations/jobs-admin';

export type SaveJobState =
  | { ok: true; jobId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | undefined;

const formEnvelope = z.object({
  id: z.string().optional(),
  action: z.enum(['draft', 'publish']).default('publish'),
});

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v : '';
}

export async function saveJob(_prev: SaveJobState, formData: FormData): Promise<SaveJobState> {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);

  const envelope = formEnvelope.safeParse({
    id: fd(formData, 'id') || undefined,
    action: fd(formData, 'action') || 'publish',
  });
  if (!envelope.success) return { ok: false, error: 'Invalid form submission.' };
  const { id, action } = envelope.data;
  const publish = action === 'publish';

  const skillsRaw = fd(formData, 'skillsRequired');
  const deadlineRaw = fd(formData, 'deadline');

  const payload = {
    title: fd(formData, 'title'),
    department: fd(formData, 'department') || null,
    location: fd(formData, 'location') || null,
    workMode: fd(formData, 'workMode'),
    employmentType: fd(formData, 'employmentType'),
    experienceLevel: fd(formData, 'experienceLevel'),
    experienceYears: fd(formData, 'experienceYears') || null,
    salaryMin: fd(formData, 'salaryMin') || null,
    salaryMax: fd(formData, 'salaryMax') || null,
    salaryCurrency: fd(formData, 'salaryCurrency') || 'USD',
    skillsRequired: skillsRaw
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean),
    description: fd(formData, 'description'),
    requirements: fd(formData, 'requirements') || null,
    benefits: fd(formData, 'benefits') || null,
    deadline: deadlineRaw || null,
  };

  try {
    if (id) {
      const parsed = updateJobSchema.safeParse({
        ...payload,
        status: publish ? 'OPEN' : fd(formData, 'status') || undefined,
      });
      if (!parsed.success) {
        return {
          ok: false,
          error: 'Please fix the errors below.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      }
      const input = parsed.data;
      const job = await updateJob(
        id,
        { userId: user.id, companyId: user.companyId },
        {
          title: input.title as string,
          department: (input.department as string | null | undefined) ?? null,
          location: (input.location as string | null | undefined) ?? null,
          workMode: input.workMode as 'REMOTE' | 'HYBRID' | 'ONSITE',
          employmentType: input.employmentType as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN',
          experienceLevel: input.experienceLevel as
            | 'ENTRY'
            | 'MID'
            | 'SENIOR'
            | 'LEAD'
            | 'EXECUTIVE',
          experienceYears: (input.experienceYears as number | null | undefined) ?? null,
          salaryMin: (input.salaryMin as number | null | undefined) ?? null,
          salaryMax: (input.salaryMax as number | null | undefined) ?? null,
          salaryCurrency: (input.salaryCurrency as string | null | undefined) ?? 'USD',
          skillsRequired: (input.skillsRequired as string[] | undefined) ?? [],
          description: (input.description as string | undefined) ?? '',
          requirements: (input.requirements as string | null | undefined) ?? null,
          benefits: (input.benefits as string | null | undefined) ?? null,
          deadline: input.deadline ?? null,
          status: publish ? 'OPEN' : input.status,
        },
      );
      revalidatePath('/recruiter/dashboard');
      revalidatePath(`/recruiter/jobs/${job.id}`);
      return { ok: true, jobId: job.id };
    }

    const parsed = createJobSchema.safeParse({ ...payload, publish });
    if (!parsed.success) {
      return {
        ok: false,
        error: 'Please fix the errors below.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }
    const input = parsed.data;
    const job = await createJob(
      { userId: user.id, companyId: user.companyId },
      {
        title: input.title,
        department: input.department ?? null,
        location: input.location ?? null,
        workMode: input.workMode,
        employmentType: input.employmentType,
        experienceLevel: input.experienceLevel,
        experienceYears: input.experienceYears ?? null,
        salaryMin: input.salaryMin ?? null,
        salaryMax: input.salaryMax ?? null,
        salaryCurrency: input.salaryCurrency ?? 'USD',
        skillsRequired: input.skillsRequired,
        description: input.description,
        requirements: input.requirements ?? null,
        benefits: input.benefits ?? null,
        deadline: input.deadline ?? null,
        status: input.status,
        publish: input.publish,
      },
    );
    revalidatePath('/recruiter/dashboard');
    return { ok: true, jobId: job.id };
  } catch (err) {
    if (err instanceof RecruiterJobError) return { ok: false, error: err.message };
    if (err instanceof z.ZodError) {
      const flat = err.flatten();
      return {
        ok: false,
        error: 'Validation failed.',
        fieldErrors: flat.fieldErrors as Record<string, string[]>,
      };
    }
    throw err;
  }
}
