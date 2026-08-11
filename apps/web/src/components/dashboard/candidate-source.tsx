import { Suspense } from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/server/db';

export async function CandidateSourceWidget() {
  return (
    <Suspense fallback={null}>
      <CandidateSourceCard />
    </Suspense>
  );
}

async function CandidateSourceCard() {
  // Group applications by their source field (public_board, referral, direct_link)
  // and show top 3 sources.
  const grouped = await prisma.application.groupBy({
    by: ['source'],
    _count: { _all: true },
  });
  const total = grouped.reduce((s, g) => s + g._count._all, 0);
  const sorted = grouped.sort((a, b) => b._count._all - a._count._all);
  const top = sorted.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Candidate sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {top.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
        {top.map((g) => {
          const label = g.source ?? 'unknown';
          const pct = total > 0 ? Math.round((g._count._all / total) * 100) : 0;
          return (
            <div key={label}>
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{label.replace(/_/g, ' ')}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {g._count._all} ({pct}%)
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
