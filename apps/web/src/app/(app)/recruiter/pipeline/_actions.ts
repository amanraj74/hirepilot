'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth/rbac';
import {
  ApplicationError,
  moveApplicationToStage,
  type Stage,
} from '@/server/services/applications.service';

export type MoveStageResult = { ok: true } | { ok: false; error: string };

export async function moveStageAction(
  applicationId: string,
  stage: Stage,
): Promise<MoveStageResult> {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  try {
    await moveApplicationToStage(applicationId, stage, {
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
