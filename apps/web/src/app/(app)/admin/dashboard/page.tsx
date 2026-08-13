// Admin dashboard — platform-wide stats across every company and user.
// Aggregates from User, Job, Application, Company, AuditLog, Notification.

import Link from 'next/link';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { Activity, Building2, ScrollText, ShieldCheck, Users } from 'lucide-react';
import { prisma } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ROLE_COLOR: Record<string, string> = {
  CANDIDATE: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  RECRUITER: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400',
  HIRING_MANAGER: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  INTERVIEWER: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  ADMIN: 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
};

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  SUSPENDED: 'bg-red-500/15 text-red-700 dark:text-red-400',
  PENDING_VERIFICATION: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin/dashboard');
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalJobs,
    openJobs,
    totalApplications,
    totalCompanies,
    auditLast7,
    usersByRole,
    recentAudit,
    activeUsers,
    topCompanies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'CANDIDATE' } }),
    prisma.user.count({ where: { role: 'RECRUITER' } }),
    prisma.job.count({ where: { deletedAt: null } }),
    prisma.job.count({ where: { status: 'OPEN', deletedAt: null } }),
    prisma.application.count({ where: { deletedAt: null } }),
    prisma.company.count(),
    new Date(Date.now() - 7 * 86400000),
    prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        actor: { select: { name: true, email: true, role: true } },
      },
    }),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.company.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, jobs: { where: { deletedAt: null } } } },
      },
    }),
  ]);

  const roleBreakdown = Object.fromEntries(usersByRole.map((r) => [r.role, r._count._all]));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
          Admin dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Platform health at a glance — {totalUsers} registered users across {totalCompanies} compan
          {totalCompanies === 1 ? 'y' : 'ies'}, {openJobs} open role{openJobs === 1 ? '' : 's'},{' '}
          {totalApplications} application{totalApplications === 1 ? '' : 's'} on file.
        </p>
      </header>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Platform stats
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-4 w-4" aria-hidden="true" />}
            label="Users"
            value={totalUsers}
            sub={`${activeUsers} active · ${totalCandidates} candidates`}
          />
          <StatCard
            icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
            label="Companies"
            value={totalCompanies}
            sub={`${totalRecruiters} recruiter${totalRecruiters === 1 ? '' : 's'}`}
          />
          <StatCard
            icon={<Activity className="h-4 w-4" aria-hidden="true" />}
            label="Jobs"
            value={totalJobs}
            sub={`${openJobs} currently open`}
          />
          <StatCard
            icon={<ScrollText className="h-4 w-4" aria-hidden="true" />}
            label="Audit events (7d)"
            value={recentAudit.filter((a) => a.createdAt >= auditLast7).length}
            sub={`${totalApplications} total applications`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Role distribution</h2>
        <Card>
          <CardContent className="flex flex-wrap gap-3 p-6">
            {(Object.keys(ROLE_COLOR) as Array<keyof typeof ROLE_COLOR>).map((role) => {
              const count = roleBreakdown[role] ?? 0;
              const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div
                  key={role}
                  className="min-w-[160px] flex-1 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[role]}`}
                    >
                      {role.replace('_', ' ')}
                    </span>
                    <span className="text-lg font-bold tabular-nums">{count}</span>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{pct}% of users</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent audit log</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/audit-logs">Full log</Link>
          </Button>
        </div>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {recentAudit.length === 0 ? (
              <div className="flex flex-col items-center gap-3 p-12 text-center">
                <ScrollText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
              </div>
            ) : (
              recentAudit.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-start justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {entry.action}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        · {entry.resource}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      by {entry.actor?.name ?? entry.actor?.email.split('@')[0] ?? 'system'}
                      {entry.actor?.role
                        ? ` (${entry.actor.role.toLowerCase().replace('_', ' ')})`
                        : ''}{' '}
                      · {formatRelativeTime(entry.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {entry.resourceId.slice(0, 8)}…
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Companies</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/companies">Manage companies</Link>
          </Button>
        </div>
        {topCompanies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No companies on file yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Industry</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Size</th>
                  <th className="px-4 py-3 text-right font-medium">Members</th>
                  <th className="px-4 py-3 text-right font-medium">Jobs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topCompanies.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.name}</p>
                      {c.website && <p className="text-xs text-muted-foreground">{c.website}</p>}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {c.industry ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {c.size ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">{c._count.users}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">{c._count.jobs}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">User status</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Breakdown of registered accounts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <StatusChip
              color={STATUS_COLOR.ACTIVE ?? 'bg-muted'}
              label="Active"
              count={activeUsers}
            />
            <StatusChip
              color={STATUS_COLOR.PENDING_VERIFICATION ?? 'bg-muted'}
              label="Pending verification"
              count={totalUsers - activeUsers}
            />
          </CardContent>
        </Card>
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

function StatusChip({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${color}`}>
        {label}
      </span>
      <span className="font-semibold tabular-nums">{count}</span>
    </div>
  );
}
