import { Suspense } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/server/db';

export async function TimeToHireWidget() {
  return (
    <Suspense fallback={null}>
      <TimeToHireCard />
    </Suspense>
  );
}

async function TimeToHireCard() {
  // Calculate average days from application to offer (or to current date) for the
  // recruiter's visible applications. Useful as a hiring velocity indicator.
  const apps = await prisma.application.findMany({
    where: { decidedAt: { not: null } },
    select: { appliedAt: true, decidedAt: true, stage: true },
  });
  if (apps.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Time to hire
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">—</div>
          <p className="mt-1 text-xs text-muted-foreground">No decided applications yet.</p>
        </CardContent>
      </Card>
    );
  }

  const daysArr = apps
    .filter((a) => a.decidedAt)
    .map((a) =>
      Math.max(0, Math.round((a.decidedAt!.getTime() - a.appliedAt.getTime()) / 86400000)),
    );
  const avg = daysArr.length ? Math.round(daysArr.reduce((s, n) => s + n, 0) / daysArr.length) : 0;
  const fastest = daysArr.length ? Math.min(...daysArr) : 0;
  const slowest = daysArr.length ? Math.max(...daysArr) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Time to hire
        </CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{avg} days</div>
        <p className="mt-1 text-xs text-muted-foreground">
          avg · fastest {fastest}d · slowest {slowest}d · {apps.length} decided
        </p>
      </CardContent>
    </Card>
  );
}
