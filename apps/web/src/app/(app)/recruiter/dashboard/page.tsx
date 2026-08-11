import Link from 'next/link';
import {
  Plus,
  BarChart3,
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  PauseCircle,
  FileEdit,
} from 'lucide-react';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRecruiterDashboardStats, listRecruiterJobs } from '@/server/services/jobs.service';
import { JobStatusBadge } from '@/components/job/job-status-badge';
import { employmentTypeLabel, formatRelativeTime, workModeLabel } from '@/lib/utils/format';
import {
  PipelineFunnelChart,
  PipelineStageDistribution,
  ConversionRateChart,
  JobStatusSummary,
} from '@/components/dashboard/charts';

export const dynamic = 'force-dynamic';

export default async function RecruiterDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const ctx = { userId: session.user.id, companyId: session.user.companyId };

  const [stats, jobs] = await Promise.all([
    getRecruiterDashboardStats(ctx),
    listRecruiterJobs(ctx),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session.user.name ?? 'recruiter'}.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your hiring pipeline at a glance. {stats.openJobs} open{' '}
            {stats.openJobs === 1 ? 'role' : 'roles'}, {stats.newApplications} new{' '}
            {stats.newApplications === 1 ? 'applicant' : 'applicants'} this round.
          </p>
        </div>
        <Button asChild>
          <Link href="/recruiter/jobs/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post a job
          </Link>
        </Button>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Pipeline stats
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
            label="Open roles"
            value={stats.openJobs}
            sub={`${stats.draftJobs} draft · ${stats.pausedJobs} paused`}
          />
          <StatCard
            icon={<Users className="h-4 w-4" aria-hidden="true" />}
            label="New applicants"
            value={stats.newApplications}
            sub={`${stats.totalApplications} total`}
          />
          <StatCard
            icon={<Clock className="h-4 w-4" aria-hidden="true" />}
            label="In interview"
            value={stats.inInterview}
            sub="Technical + HR stages"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
            label="Hired"
            value={stats.hired}
            sub={`${stats.offersExtended} offers extended`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Pipeline analytics</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <PipelineFunnelChart byStage={stats.appsByStage} />
          <PipelineStageDistribution byStage={stats.appsByStage} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ConversionRateChart byStage={stats.appsByStage} />
          <JobStatusSummary byStatus={stats.jobsByStatus} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Your jobs</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/recruiter/jobs/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New job
            </Link>
          </Button>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                You haven&rsquo;t posted any jobs yet.
              </p>
              <Button asChild>
                <Link href="/recruiter/jobs/new">Post your first job</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Work mode</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Type</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">Posted</th>
                  <th className="px-4 py-3 text-right font-medium">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
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
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {workModeLabel(job.workMode)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {employmentTypeLabel(job.employmentType)}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {job.publishedAt ? formatRelativeTime(job.publishedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                        {job.activeApplicantCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {stats.pausedJobs > 0 || stats.closedJobs > 0 ? (
        <section className="text-sm text-muted-foreground">
          {stats.pausedJobs > 0 && (
            <p className="flex items-center gap-1.5">
              <PauseCircle className="h-4 w-4" aria-hidden="true" />
              {stats.pausedJobs} job{stats.pausedJobs === 1 ? '' : 's'} currently paused.
            </p>
          )}
          {stats.closedJobs > 0 && (
            <p className="mt-1 flex items-center gap-1.5">
              <FileEdit className="h-4 w-4" aria-hidden="true" />
              {stats.closedJobs} closed job{stats.closedJobs === 1 ? '' : 's'} in your history.
            </p>
          )}
        </section>
      ) : null}
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
  value: number;
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
