// PATCH /api/recruiter/applications/[id]/stage  — move an application to a new stage

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/server/auth/rbac';
import { ApplicationError, moveApplicationToStage } from '@/server/services/applications.service';
import { moveStageSchema } from '@/lib/validations/applications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['RECRUITER', 'HIRING_MANAGER', 'ADMIN']);
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = moveStageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Invalid stage',
        status: 422,
        detail: parsed.error.flatten().fieldErrors,
      },
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    );
  }
  try {
    const updated = await moveApplicationToStage(id, parsed.data.stage, {
      userId: user.id,
      companyId: user.companyId,
      actorRole: user.role as 'RECRUITER' | 'HIRING_MANAGER' | 'ADMIN',
    });
    revalidatePath('/recruiter/pipeline');
    revalidatePath('/recruiter/dashboard');
    return NextResponse.json({ data: { id: updated.id, stage: updated.stage } });
  } catch (err) {
    if (err instanceof ApplicationError) {
      return NextResponse.json(
        { type: 'about:blank', title: err.message, status: err.status },
        { status: err.status, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    throw err;
  }
}
