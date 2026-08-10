import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Briefcase, MapPin, Wallet } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { listMyApplications } from '@/server/services/applications.service';
import { prisma } from '@/server/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { employmentTypeLabel, formatRelativeTime, workModeLabel } from '@/lib/utils/format';
import { STAGE_LABEL } from '@/server/services/applications.service';

export const metadata: Metadata = {
  title: 'My applications · HirePilot',
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STAGE_COLOR: Record<string, string> = {
  APPLIED: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  RESUME_SCREENING: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  SHORTLISTED: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  TECHNICAL_INTERVIEW: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  HR_INTERVIEW: 'bg-orange-500/15 text-orange-700 dark:text-orange-400',
  OFFER: 'bg-green-500/15 text-green-700 dark:text-green-400',
  HIRED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  REJECTED: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default async function MyApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string; already?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/applications');
  if (session.user.role !== 'CANDIDATE') redirect('/dashboard');

  const sp = await searchParams;
  const justApplied = !!sp.applied;
  const alreadyAppliedToPage = !!sp.already;

  const applications = await listMyApplications(session.user.id);

  // Count unread notifications for the header banner / interaction.
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">My applications</h1>
        <p className="mt-2 text-muted-foreground">
          {applications.length === 0
            ? "You haven't applied to any jobs yet."
            : `${applications.length} total · ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.`}
        </p>
      </header>

      {justApplied && (
        <div className="rounded-md border border-green-600/40 bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          Application submitted. The recruiter will review it shortly.
        </div>
      )}
      {alreadyAppliedToPage && (
        <div className="rounded-md border border-blue-600/40 bg-blue-600/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
          You already applied to this job. Track its progress below.
        </div>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No applications yet.</p>
            <Button asChild>
              <Link href="/jobs">Browse open jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/jobs/${app.job.id}`}
                className="block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{app.job.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{app.job.company}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {workModeLabel(app.job.workMode)} · {app.job.location ?? 'Anywhere'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="h-3 w-3" aria-hidden="true" />
                        {employmentTypeLabel(app.job.employmentType)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3 w-3" aria-hidden="true" />
                        Applied {formatRelativeTime(app.appliedAt)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${STAGE_COLOR[app.stage] ?? 'bg-muted text-muted-foreground'}`}
                  >
                    {STAGE_LABEL[app.stage]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
