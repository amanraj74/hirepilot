'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { KanbanBoard, type KanbanApplication } from './kanban-board';
import { SendOfferModal } from '@/app/(app)/recruiter/pipeline/_components/send-offer-modal';

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

  return (
    <>
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
