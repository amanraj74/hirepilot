import { Suspense } from 'react';
import { Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/server/db';

export async function InterviewSuccessWidget() {
  return (
    <Suspense fallback={null}>
      <InterviewSuccessCard />
    </Suspense>
  );
}

async function InterviewSuccessCard() {
  // % of completed interviews that led to an offer.
  const [completed, offerAfter] = await Promise.all([
    prisma.interview.count({ where: { status: 'COMPLETED' } }),
    prisma.interview.count({
      where: { status: 'COMPLETED', application: { stage: { in: ['OFFER', 'HIRED'] } } },
    }),
  ]);
  const pct = completed > 0 ? Math.round((offerAfter / completed) * 100) : 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Interview success
        </CardTitle>
        <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pct}%</div>
        <p className="mt-1 text-xs text-muted-foreground">
          {offerAfter} of {completed} completed led to an offer
        </p>
      </CardContent>
    </Card>
  );
}
