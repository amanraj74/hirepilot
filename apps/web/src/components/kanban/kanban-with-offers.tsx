'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Zap } from 'lucide-react';
import { KanbanBoard, type KanbanApplication } from './kanban-board';
import { SendOfferModal } from '@/app/(app)/recruiter/pipeline/_components/send-offer-modal';
import { useEventStream } from '@/lib/hooks/use-event-stream';

export type { KanbanApplication };

const SUGGESTED_BENEFITS = [
  'Remote-first',
  'Competitive equity',
  '30 days PTO',
  'Health insurance',
  'Learning budget',
  'Conference travel',
  '401(k) matching',
  'Wellness stipend',
  'Home office stipend',
  'Flexible hours',
];

export function KanbanBoardWithOffers({
  initialApplications,
  moveAction,
}: {
  initialApplications: KanbanApplication[];
  moveAction: (
    id: string,
    stage: KanbanApplication['stage'],
  ) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [offerFor, setOfferFor] = useState<KanbanApplication | null>(null);
  const router = useRouter();

  // Live updates: when any recruiter in this company moves an
  // application, the server publishes a 'stage' event over SSE and we
  // refresh the page so the drag-drop result is visible to everyone
  // watching — no manual reload.
  // The 'connected' flag lights up a small "Live" badge so users know
  // the live feed is active.
  const { connected } = useEventStream('/api/recruiter/pipeline/stream', {
    onEvent: (e) => {
      if (e.type === 'stage') router.refresh();
    },
  });

  return (
    <>
      <div className="flex items-center justify-end">
        <span
          className={
            'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ' +
            (connected
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400')
          }
          aria-live="polite"
          title={connected ? 'Real-time updates active' : 'Real-time updates reconnecting…'}
        >
          <Zap className="h-2.5 w-2.5" aria-hidden="true" />
          {connected ? 'Live' : 'Reconnecting'}
        </span>
      </div>
      <KanbanBoard
        initialApplications={initialApplications}
        moveAction={moveAction}
        renderCardExtra={(app) => {
          // Only show "Send offer" on cards in the OFFER column that
          // haven't received an offer yet (we don't track that in the
          // summary yet — for now, every OFFER card shows the button).
          if (app.stage !== 'OFFER') return null;
          return (
            <button
              type="button"
              onClick={() => setOfferFor(app)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-3 w-3" aria-hidden="true" />
              Send offer
            </button>
          );
        }}
      />
      {offerFor && (
        <SendOfferModal
          applicationId={offerFor.id}
          candidateName={offerFor.candidateName}
          jobTitle={offerFor.jobTitle}
          defaultSalaryMin={null}
          defaultSalaryMax={null}
          defaultLocation={offerFor.jobTitle ? 'Remote' : null}
          benefits={[]}
          suggestedBenefits={SUGGESTED_BENEFITS}
          open
          onOpenChange={(open) => {
            if (!open) setOfferFor(null);
          }}
        />
      )}
    </>
  );
}
