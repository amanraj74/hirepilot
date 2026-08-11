import { Suspense } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/server/db';
import { auth } from '@/server/auth';

export async function RecruiterPerformanceWidget() {
  return (
    <Suspense fallback={null}>
      <RecruiterPerformanceCard />
    </Suspense>
  );
}

async function RecruiterPerformanceCard() {
  // Show the logged-in recruiter's KPIs: jobs posted, apps received, hired.
  const session = await auth();
  if (!session?.user) return null;
  const userId = session.user.id;
  const companyId = session.user.companyId;

  const [jobsPosted, appsReceived, hiredByMe] = await Promise.all([
    prisma.job.count({
      where: companyId ? { OR: [{ postedById: userId }, { companyId }] } : { postedById: userId },
    }),
    prisma.application.count({
      where: {
        job: companyId ? { OR: [{ postedById: userId }, { companyId }] } : { postedById: userId },
      },
    }),
    prisma.application.count({
      where: {
        stage: 'HIRED',
        job: companyId ? { OR: [{ postedById: userId }, { companyId }] } : { postedById: userId },
      },
    }),
  ]);

  const convRate = appsReceived > 0 ? Math.round((hiredByMe / appsReceived) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Your performance
        </CardTitle>
        <CardDescription>Conversion rate, applications, hires</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Row label="Jobs posted" value={jobsPosted} />
        <Row label="Applications received" value={appsReceived} />
        <Row label="Hired" value={hiredByMe} />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-sm font-semibold">Conversion</span>
          <span className="font-mono text-sm text-primary">{convRate}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </div>
  );
}
