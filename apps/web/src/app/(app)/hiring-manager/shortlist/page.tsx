// /hiring-manager/shortlist — HM-scoped view of candidates who reached
// the TECHNICAL_INTERVIEW or HR_INTERVIEW stage (i.e. awaiting HM
// decision). Shows side-by-side candidate data so HM can decide who
// to advance.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { STAGE_LABEL } from '@/server/services/applications.service';
import { formatRelativeTime, workModeLabel } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STAGE_COLOR: Record<string, string> = {
  TECHNICAL_INTERVIEW: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  HR_INTERVIEW: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  OFFER: 'bg-green-500/15 text-green-700 dark:text-green-400',
  SHORTLISTED: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
};

export default async function HiringManagerShortlistPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/hiring-manager/shortlist');
  if (session.user.role !== 'HIRING_MANAGER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>No company linked</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Candidates in active decision stages for jobs in the HM's company.
  const apps = await prisma.application.findMany({
    where: {
      deletedAt: null,
      stage: { in: ['SHORTLISTED', 'TECHNICAL_INTERVIEW', 'HR_INTERVIEW', 'OFFER'] },
      job: { companyId },
    },
    orderBy: [{ stage: 'asc' }, { updatedAt: 'desc' }],
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          candidateProfile: {
            select: {
              headline: true,
              skills: true,
              totalExperienceYears: true,
            },
          },
        },
      },
      job: { select: { id: true, title: true, department: true, workMode: true, location: true } },
      interviews: {
        select: {
          id: true,
          status: true,
          feedback: {
            select: {
              recommendation: true,
              overallRating: true,
              interviewer: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Shortlist</h1>
        <p className="mt-2 text-muted-foreground">
          {apps.length} candidate{apps.length === 1 ? '' : 's'} awaiting your decision.
        </p>
      </header>

      {apps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No candidates in your decision stages right now.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/recruiter/pipeline">View pipeline</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {apps.map((a) => {
            const skills = (a.candidate.candidateProfile?.skills ?? []).slice(0, 4);
            // Flatten feedback across all interviews for this application.
            const allFeedback = a.interviews.flatMap((iv) => iv.feedback);
            const avgRating =
              allFeedback.length > 0
                ? allFeedback.reduce((s, f) => s + f.overallRating, 0) / allFeedback.length
                : null;
            const recommendations = allFeedback.map((f) => f.recommendation).filter(Boolean);
            return (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {a.candidate.name ?? a.candidate.email.split('@')[0]}
                      </CardTitle>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {a.job.title}
                        {a.job.department ? ` · ${a.job.department}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className={STAGE_COLOR[a.stage] ?? 'bg-zinc-500/15'}>
                      {STAGE_LABEL[a.stage as keyof typeof STAGE_LABEL] ?? a.stage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {a.candidate.candidateProfile?.headline && (
                    <p className="text-muted-foreground">{a.candidate.candidateProfile.headline}</p>
                  )}
                  {a.candidate.candidateProfile?.totalExperienceYears !== null &&
                    a.candidate.candidateProfile?.totalExperienceYears !== undefined &&
                    a.candidate.candidateProfile.totalExperienceYears > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {a.candidate.candidateProfile.totalExperienceYears} years experience
                      </p>
                    )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {allFeedback.length > 0 && (
                    <div className="rounded-md border border-border bg-background p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Interview feedback</span>
                        {avgRating !== null && (
                          <span className="font-mono">{avgRating.toFixed(1)}/5</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {recommendations.map((r, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {r?.toLowerCase().replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Updated {formatRelativeTime(a.updatedAt)} · {workModeLabel(a.job.workMode)} ·{' '}
                    {a.job.location ?? 'Anywhere'}
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/recruiter/pipeline">Open in pipeline</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
