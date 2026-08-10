import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { KanbanSquare } from 'lucide-react';
import { auth } from '@/server/auth';
import { listApplicationsForRecruiter } from '@/server/services/applications.service';
import { KanbanBoard, type KanbanApplication } from '@/components/kanban/kanban-board';
import { moveStageAction } from './_actions';

export const metadata: Metadata = {
  title: 'Pipeline · HirePilot',
};

export default async function PipelinePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
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
        <KanbanBoard
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
