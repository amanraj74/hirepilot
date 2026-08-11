import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { KanbanSquare } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { listApplicationsForRecruiter } from '@/server/services/applications.service';
import {
  KanbanBoardWithOffers,
  type KanbanApplication,
} from '@/components/kanban/kanban-with-offers';
import { moveStageAction } from './actions';

export const metadata: Metadata = {
  title: 'Pipeline · HirePilot',
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function PipelinePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/recruiter/pipeline');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const applications = (await listApplicationsForRecruiter({
    userId: session.user.id,
    companyId: session.user.companyId,
  })) as KanbanApplication[];

  const totalActive = applications.filter(
    (a) => a.stage !== 'HIRED' && a.stage !== 'REJECTED',
  ).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <KanbanSquare className="h-7 w-7 text-primary" aria-hidden="true" />
          Pipeline
        </h1>
        <p className="mt-2 text-muted-foreground">
          {totalActive} active {totalActive === 1 ? 'candidate' : 'candidates'} across{' '}
          {applications.length} total. Drag a card between columns to update the stage.
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-16 text-center">
          <KanbanSquare className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            No applications yet. Once candidates apply to your open jobs, they&rsquo;ll appear here.
          </p>
        </div>
      ) : (
        <KanbanBoardWithOffers
          initialApplications={applications}
          moveAction={async (id, stage) => {
            'use server';
            return moveStageAction(id, stage);
          }}
        />
      )}
    </div>
  );
}
