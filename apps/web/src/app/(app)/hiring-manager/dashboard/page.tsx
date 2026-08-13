// Hiring Manager dashboard — shows the review queue of candidates awaiting
// HM final decision (HR_INTERVIEW or OFFER stage), active jobs in the
// company, and recent interview feedback submitted by interviewers.

import Link from 'next/link';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { Briefcase, CheckCircle2, Clock, Gavel, MessageSquare, Users } from 'lucide-react';
import { prisma } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STAGE_LABEL } from '@/server/services/applications.service';
import { formatRelativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STAGE_COLOR: Record<string, string> = {
  HR_INTERVIEW: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  OFFER: 'bg-green-500/15 text-green-700 dark:text-green-400',
  HIRED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
};

const RECOMMENDATION_LABEL: Record<string, string> = {
  STRONG_HIRE: 'Strong hire',
  HIRE: 'Hire',
  NO_HIRE: 'No hire',
  STRONG_NO_HIRE: 'Strong no hire',
};

const RECOMMENDATION_COLOR: Record<string, string> = {
  STRONG_HIRE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  HIRE: 'bg-green-500/15 text-green-700 dark:text-green-400',
  NO_HIRE: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  STRONG_NO_HIRE: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default async function HiringManagerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/hiring-manager/dashboard');
  if (session.user.role !== 'HIRING_MANAGER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { companyId } = session.user;

  // HM without a company sees a useful message but no broken layout.
  const hasCompany = !!companyId;

  // Build where clauses scoped to the HM's company.
  const jobsWhere = hasCompany ? { companyId: companyId!, deletedAt: null } : { id: '__none__' };
  const appWhere = hasCompany ? { job: { companyId: companyId! } } : { id: '__none__' };

  const [
    awaitingDecision,
    activeJobs,
    completedInterviews,
    hiredThisMonth,
    recentFeedback,
    openJobs,
  ] = await Promise.all([
    prisma.application.findMany({
      where: {
        ...appWhere,
        stage: { in: ['HR_INTERVIEW', 'OFFER'] },
        deletedAt: null,
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true, company: { select: { name: true } } } },
      },
      orderBy: [{ stage: 'desc' }, { updatedAt: 'desc' }],
      take: 20,
    }),
    prisma.job.count({
      where: { ...jobsWhere, status: { in: ['OPEN', 'PAUSED'] } },
    }),
    prisma.interview.count({
      where: {
        application: appWhere,
        status: 'COMPLETED',
      },
    }),
    prisma.application.count({
      where: {
        ...appWhere,
        stage: 'HIRED',
        decidedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.interviewFeedback.findMany({
      where: {
        interview: {
          application: appWhere,
        },
      },
      include: {
        interviewer: { select: { name: true, email: true } },
        interview: {
          select: {
            id: true,
            type: true,
            scheduledAt: true,
            application: {
              select: {
                candidate: { select: { name: true, email: true } },
                job: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 8,
    }),
    prisma.job.findMany({
      where: { ...jobsWhere, status: 'OPEN' },
      include: {
        _count: { select: { applications: { where: { deletedAt: null } } } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    }),
  ]);

  const avgRating = recentFeedback.length
    ? (recentFeedback.reduce((s, f) => s + f.overallRating, 0) / recentFeedback.length).toFixed(1)
    : '—';

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Gavel className="h-7 w-7 text-primary" aria-hidden="true" />
          Hiring manager dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {session.user.name ?? 'hiring manager'}.{' '}
          {awaitingDecision.length === 0
            ? 'No candidates waiting on your decision right now.'
            : `${awaitingDecision.length} candidate${awaitingDecision.length === 1 ? '' : 's'} awaiting your decision.`}
        </p>
      </header>

      {!hasCompany && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Your account is not linked to a company yet. Ask a recruiter or admin to associate you
            with one to see your hiring pipeline.
          </CardContent>
        </Card>
      )}

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Hiring manager stats
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Gavel className="h-4 w-4" aria-hidden="true" />}
            label="Awaiting decision"
            value={awaitingDecision.length}
            sub={`${awaitingDecision.filter((a) => a.stage === 'OFFER').length} at offer stage`}
          />
          <StatCard
            icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
            label="Active jobs"
            value={activeJobs}
            sub="Open + paused"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            label="Interviews completed"
            value={completedInterviews}
            sub="Lifetime"
          />
          <StatCard
            icon={<Users className="h-4 w-4" aria-hidden="true" />}
            label="Hired this month"
            value={hiredThisMonth}
            sub={`Avg score ${avgRating}/5`}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Awaiting your decision</h2>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {awaitingDecision.length} candidate{awaitingDecision.length === 1 ? '' : 's'}
          </span>
        </div>
        {awaitingDecision.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Everyone in your review queue has been processed. New candidates appear here when
                they reach HR interview or offer stage.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {awaitingDecision.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {a.candidate.name ?? a.candidate.email.split('@')[0]}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.job.title}
                      {a.job.company ? ` · ${a.job.company.name}` : ''} · moved{' '}
                      {formatRelativeTime(a.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${STAGE_COLOR[a.stage]}`}
                    >
                      {STAGE_LABEL[a.stage as keyof typeof STAGE_LABEL] ?? a.stage}
                    </span>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/recruiter/pipeline">Review</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Recent interview feedback</h2>
        {recentFeedback.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No interviewer feedback yet. Feedback appears here as your team completes
                scorecards.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recentFeedback.slice(0, 6).map((f) => (
              <Card key={f.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm">
                        {f.interview.application.candidate.name ??
                          f.interview.application.candidate.email.split('@')[0]}
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {f.interview.application.job.title} · {f.interview.type.toLowerCase()}{' '}
                        interview
                      </p>
                    </div>
                    {f.recommendation && (
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${RECOMMENDATION_COLOR[f.recommendation] ?? 'bg-muted'}`}
                      >
                        {RECOMMENDATION_LABEL[f.recommendation] ?? f.recommendation}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>By {f.interviewer.name ?? f.interviewer.email.split('@')[0]}</span>
                    <span>{formatRelativeTime(f.submittedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        aria-hidden="true"
                        className={
                          i < f.overallRating ? 'text-amber-500' : 'text-muted-foreground/30'
                        }
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-1.5 text-muted-foreground">
                      {f.overallRating}/5 overall
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Active roles</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/recruiter/jobs">All jobs</Link>
          </Button>
        </div>
        {openJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No open roles in your company right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Posted</th>
                  <th className="px-4 py-3 text-right font-medium">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {openJobs.map((job) => (
                  <tr key={job.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/recruiter/jobs/${job.id}`}
                        className="font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                      {job.department && (
                        <div className="text-xs text-muted-foreground">{job.department}</div>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {job.publishedAt ? formatRelativeTime(job.publishedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">{job._count.applications}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {recentFeedback.length > 0 && completedInterviews === 0 && (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden="true" />
          Interview counters update when an interview is marked complete.
        </p>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
