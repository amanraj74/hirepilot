'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth/rbac';
import {
  ApplicationError,
  moveApplicationToStage,
  type Stage,
} from '@/server/services/applications.service';
import { OfferError, sendOffer } from '@/server/services/offers.service';
import { sendOfferSchema } from '@/lib/validations/offers';

export type MoveStageResult = { ok: boolean; error?: string };
export type SendOfferState =
  | { ok: true; offerId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | undefined;

// ----- Move stage (Kanban drag-drop) -------------------------------------

export async function moveStageAction(
  applicationId: string,
  toStage: Stage,
): Promise<MoveStageResult> {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  try {
    await moveApplicationToStage(applicationId, toStage, {
      userId: user.id,
      companyId: user.companyId,
      actorRole: user.role as 'RECRUITER' | 'HIRING_MANAGER' | 'ADMIN',
    });
    revalidatePath('/recruiter/pipeline');
    revalidatePath('/recruiter/dashboard');
    return { ok: true };
  } catch (err) {
    if (err instanceof ApplicationError) return { ok: false, error: err.message };
    return { ok: false, error: 'Could not move application' };
  }
}

// ----- Send offer ------------------------------------------------------

export async function sendOfferAction(
  _prev: SendOfferState,
  formData: FormData,
): Promise<SendOfferState> {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);

  // Normalise benefits — accept comma-separated string or repeated fields.
  const rawBenefits = formData.getAll('benefits').map(String).filter(Boolean);
  const benefits =
    rawBenefits.length > 0
      ? rawBenefits
      : (fd(formData, 'benefits') ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

  const parsed = sendOfferSchema.safeParse({
    applicationId: fd(formData, 'applicationId'),
    salaryAmount: fd(formData, 'salaryAmount'),
    salaryCurrency: fd(formData, 'salaryCurrency') || 'USD',
    joiningDate: fd(formData, 'joiningDate'),
    expiresAt: fd(formData, 'expiresAt') || undefined,
    location: fd(formData, 'location') || undefined,
    benefits,
    bodyMarkdown: fd(formData, 'bodyMarkdown') || undefined,
  });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return {
      ok: false,
      error: first ?? 'Please check the form fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const { offer } = await sendOffer(
      { userId: user.id, companyId: user.companyId },
      {
        applicationId: parsed.data.applicationId,
        salaryAmount: parsed.data.salaryAmount,
        salaryCurrency: parsed.data.salaryCurrency,
        joiningDate: parsed.data.joiningDate,
        expiresAt: parsed.data.expiresAt,
        location: parsed.data.location,
        benefits: parsed.data.benefits,
        bodyMarkdown: parsed.data.bodyMarkdown,
      },
    );
    revalidatePath('/recruiter/pipeline');
    revalidatePath('/recruiter/dashboard');
    revalidatePath('/applications');
    return { ok: true, offerId: offer.id };
  } catch (err) {
    if (err instanceof OfferError) return { ok: false, error: err.message };
    throw err;
  }
}

function fd(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v : '';
}
