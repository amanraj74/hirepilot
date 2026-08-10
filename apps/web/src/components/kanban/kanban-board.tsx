'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { STAGE_ORDER, STAGE_LABEL, type Stage } from '@/server/services/applications.service';

export type KanbanApplication = {
  id: string;
  stage: Stage;
  jobId: string;
  jobTitle: string;
  jobDepartment: string | null;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateImage: string | null;
  matchScore: number | null;
  appliedAt: Date | string;
  updatedAt: Date | string;
};

export function KanbanBoard({
  initialApplications,
  moveAction,
}: {
  initialApplications: KanbanApplication[];
  moveAction: (id: string, stage: Stage) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [apps, setApps] = useState(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStage = useMemo(() => {
    const map: Record<Stage, KanbanApplication[]> = {
      APPLIED: [],
      RESUME_SCREENING: [],
      SHORTLISTED: [],
      TECHNICAL_INTERVIEW: [],
      HR_INTERVIEW: [],
      OFFER: [],
      HIRED: [],
      REJECTED: [],
    };
    for (const a of apps) map[a.stage].push(a);
    return map;
  }, [apps]);

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setError(null);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const appId = String(active.id);
    const targetStage = String(over.id) as Stage;
    const current = apps.find((a) => a.id === appId);
    if (!current || current.stage === targetStage) return;
    if (!STAGE_ORDER.includes(targetStage)) return;

    // Optimistic update.
    const previous = apps;
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, stage: targetStage, updatedAt: new Date() } : a)),
    );

    try {
      const result = await moveAction(appId, targetStage);
      if (!result.ok) {
        setApps(previous);
        setError(result.error ?? 'Failed to move application');
        return;
      }
      // Refresh server data so audit log + notification timestamps are accurate.
      startTransition(() => router.refresh());
    } catch {
      setApps(previous);
      setError('Network error — could not save the move');
    }
  }

  const activeApp = activeId ? apps.find((a) => a.id === activeId) : null;

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max gap-3">
            {STAGE_ORDER.map((stage) => (
              <KanbanColumn key={stage} stage={stage} count={byStage[stage].length}>
                {byStage[stage].map((app) => (
                  <DraggableCard key={app.id} app={app} />
                ))}
                {byStage[stage].length === 0 && (
                  <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
                    Drop here
                  </div>
                )}
              </KanbanColumn>
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeApp ? (
            <div className="rotate-2 opacity-90">
              <ApplicationCardContent app={activeApp} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  stage,
  count,
  children,
}: {
  stage: Stage;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-wide">{STAGE_LABEL[stage]}</h3>
        <Badge variant={count === 0 ? 'outline' : 'secondary'} className="font-mono text-xs">
          {count}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-2 transition-colors',
          isOver && 'border-primary bg-primary/5',
        )}
        style={{ minHeight: '200px' }}
      >
        {children}
      </div>
    </div>
  );
}

function DraggableCard({ app }: { app: KanbanApplication }) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({ id: app.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
      }
      className={cn(isDragging && 'invisible')}
    >
      <ApplicationCardContent app={app} />
    </div>
  );
}

function ApplicationCardContent({
  app,
  dragging = false,
}: {
  app: KanbanApplication;
  dragging?: boolean;
}) {
  const initials = app.candidateName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow',
        dragging ? 'shadow-lg ring-2 ring-primary/40' : 'hover:shadow-md',
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{app.candidateName}</p>
          <p className="truncate text-xs text-muted-foreground">{app.jobTitle}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Applied {formatRelativeTime(app.appliedAt)}</span>
        {app.matchScore !== null && app.matchScore !== undefined && (
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 font-mono font-semibold',
              app.matchScore >= 75
                ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                : app.matchScore >= 50
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  : 'bg-red-500/15 text-red-700 dark:text-red-400',
            )}
          >
            {app.matchScore}%
          </span>
        )}
      </div>
    </div>
  );
}

// Re-export for the page to use without re-importing from server.
export { STAGE_ORDER as KANBAN_STAGES };
export { STAGE_LABEL as KANBAN_STAGE_LABELS };
