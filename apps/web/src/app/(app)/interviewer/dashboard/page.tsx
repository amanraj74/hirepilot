// Interviewer dashboard — personal queue of interviews to attend and
// scorecards to submit. All queries are scoped by the interviewer's userId
// via InterviewParticipant + InterviewFeedback.

import Link from 'next/link';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { CalendarClock, CheckCircle2, ClipboardCheck, ClipboardList, Star } from 'lucide-react';
import { prisma } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TYPE_LABEL: Record<string, string> = {
  PHONE: 'Phone',
  TECHNICAL: 'Technical',
  HR: 'HR',
  PANEL: 'Panel',
  ONSITE: 'Onsite',
};

const RECOMMENDATION_LABEL: Record<string, string> = {
  STRONG_HIRE: 'Strong hire',
  HIRE: 'Hire',
  NO_HIRE: 'No hire',
  STRONG_NO_HIRE: 'Strong no hire',
};

export default async function InterviewerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/interviewer/dashboard');
  if (session.user.role !== 'INTERVIEWER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const userId = session.user.id;

  const [upcomingInterviews, pendingFeedback, recentFeedback, monthStart, lifetimeCount] =
    await Promise.all([
      prisma.interview.findMany({
        where: {
          participants: { some: { userId } },
          status: 'SCHEDULED',
          scheduledAt: { gte: new Date() },
        },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, name: true, email: true } },
              job: { select: { title: true, company: { select: { name: true } } } },
            },
          },
          feedback: { where: { interviewerId: userId }, select: { id: true } },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      }),
      prisma.interview.findMany({
        where: {
          participants: { some: { userId } },
          status: { in: ['SCHEDULED', 'COMPLETED'] },
          feedback: { none: { interviewerId: userId } },
        },
        include: {
          application: {
            include: {
              candidate: { select: { name: true, email: true } },
              job: { select: { title: true, company: { select: { name: true } } } },
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      }),
      prisma.interviewFeedback.findMany({
        where: { interviewerId: userId },
        include: {
          interview: {
            select: {
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
        take: 5,
      }),
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      prisma.interviewFeedback.count({ where: { interviewerId: userId } }),
    ]);

  const completedThisMonth = await prisma.interviewFeedback.count({
    where: { interviewerId: userId, submittedAt: { gte: monthStart } },
  });

  const avgOverall =
    recentFeedback.length > 0
      ? recentFeedback.reduce((s, f) => s + f.overallRating, 0) / recentFeedback.length
      : null;

  const nextUp = upcomingInterviews[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <ClipboardList className="h-7 w-7 text-primary" aria-hidden="true" />
          Interviewer dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back, {session.user.name ?? 'interviewer'}.{' '}
          {nextUp
            ? `Your next interview is ${nextUp.application.candidate.name ?? nextUp.application.candidate.email.split('@')[0]} on ${nextUp.scheduledAt.toLocaleString()}.`
            : 'No interviews on your calendar right now.'}
        </p>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Interviewer stats
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarClock className="h-4 w-4" aria-hidden="true" />}
            label="Upcoming interviews"
            value={upcomingInterviews.length}
            sub={`${upcomingInterviews.filter((iv) => iv.feedback.length > 0).length} already scored`}
          />
          <StatCard
            icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />}
            label="Awaiting your feedback"
            value={pendingFeedback.length}
            sub="Scorecards not yet submitted"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            label="Submitted this month"
            value={completedThisMonth}
            sub={`${lifetimeCount} total lifetime`}
          />
          <StatCard
            icon={<Star className="h-4 w-4" aria-hidden="true" />}
            label="Avg overall rating"
            value={avgOverall !== null ? `${avgOverall.toFixed(1)} / 5` : '—'}
            sub={`Last ${recentFeedback.length} submission${recentFeedback.length === 1 ? '' : 's'}`}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Upcoming on your calendar</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/interviewer/assignments">All assignments</Link>
          </Button>
        </div>
        {upcomingInterviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <CalendarClock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                You have no upcoming interviews. Recruiters will assign you to candidates as they
                reach the interview stage.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {upcomingInterviews.map((iv) => {
                const alreadyScored = iv.feedback.length > 0;
                return (
                  <div
                    key={iv.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {iv.application.candidate.name ??
                          iv.application.candidate.email.split('@')[0]}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          · {TYPE_LABEL[iv.type] ?? iv.type} · {iv.application.job.title}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {iv.scheduledAt.toLocaleString()} · {iv.durationMins} min ·{' '}
                        {iv.platform.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {alreadyScored ? (
                        <Badge variant="secondary">Scored</Badge>
                      ) : (
                        <Badge variant="outline">Awaiting scorecard</Badge>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/recruiter/interviews/${iv.id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">
          Recent feedback you've submitted
        </h2>
        {recentFeedback.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                You haven&rsquo;t submitted any scorecards yet. Open an interview from the list
                above and submit the 6-dimension scorecard after it wraps.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentFeedback.map((f) => (
              <Card key={f.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm">
                        {f.interview.application.candidate.name ??
                          f.interview.application.candidate.email.split('@')[0]}
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {f.interview.application.job.title} ·{' '}
                        {TYPE_LABEL[f.interview.type] ?? f.interview.type}
                      </p>
                    </div>
                    {f.recommendation && (
                      <Badge variant="outline" className="shrink-0">
                        {RECOMMENDATION_LABEL[f.recommendation] ?? f.recommendation}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs text-muted-foreground">
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
                    <span className="ml-1.5">{f.overallRating}/5 overall</span>
                  </div>
                  <p>
                    Submitted {formatRelativeTime(f.submittedAt)} on{' '}
                    {f.interview.scheduledAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
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
