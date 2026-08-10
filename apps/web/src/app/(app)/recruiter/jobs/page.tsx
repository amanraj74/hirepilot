import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { listRecruiterJobs } from '@/server/services/jobs.service';
import { JobStatusBadge } from '@/components/job/job-status-badge';
import { employmentTypeLabel, formatRelativeTime, workModeLabel } from '@/lib/utils/format';

export const metadata: Metadata = {
  title: 'My jobs · HirePilot',
};

export const dynamic = 'force-dynamic';

export default async function RecruiterJobsListPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const jobs = await listRecruiterJobs({
    userId: session.user.id,
    companyId: session.user.companyId,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My jobs</h1>
          <p className="mt-1 text-muted-foreground">
            {jobs.length} total · manage status, copy, or archive.
          </p>
        </div>
        <Button asChild>
          <Link href="/recruiter/jobs/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Post a job
          </Link>
        </Button>
      </header>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
            <Button asChild>
              <Link href="/recruiter/jobs/new">Post your first job</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/recruiter/jobs/${job.id}`}
              className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold group-hover:underline">
                    {job.title}
                  </h3>
                  {job.department && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {job.department}
                    </p>
                  )}
                </div>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5">
                  {workModeLabel(job.workMode)}
                </span>
                <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5">
                  {employmentTypeLabel(job.employmentType)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {job.publishedAt
                    ? `Published ${formatRelativeTime(job.publishedAt)}`
                    : 'Not published'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.activeApplicantCount} applicant{job.activeApplicantCount === 1 ? '' : 's'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
