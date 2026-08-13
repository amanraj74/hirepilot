// /admin/audit-logs — paginated audit log of privileged actions.
// Records actor, action, resource, before/after, IP, user-agent.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ACTION_COLOR: Record<string, string> = {
  'application.created': 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  'application.stage.moved': 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
  'job.created': 'bg-green-500/15 text-green-700 dark:text-green-400',
  'job.updated': 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  'job.deleted': 'bg-red-500/15 text-red-700 dark:text-red-400',
  'user.role.changed': 'bg-rose-500/15 text-rose-700 dark:text-rose-400',
  'user.suspended': 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin/audit-logs');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 50;
  const actionFilter = sp.action;

  const where = actionFilter ? { action: { contains: actionFilter } } : {};

  const [items, total, actionCounts] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true, email: true, role: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({
      by: ['action'],
      _count: { _all: true },
      orderBy: { _count: { action: 'desc' } },
      take: 10,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit log</h1>
          <p className="mt-2 text-muted-foreground">
            {total.toLocaleString()} events recorded · page {page} of {totalPages}
          </p>
        </div>
        {actionFilter && (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/audit-logs">Clear filter</Link>
          </Button>
        )}
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top actions
        </h2>
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-4">
            {actionCounts.map((a) => (
              <Link
                key={a.action}
                href={`/admin/audit-logs?action=${encodeURIComponent(a.action)}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-muted"
              >
                <span className="font-mono">{a.action}</span>
                <span className="text-muted-foreground">({a._count._all})</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {items.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No audit entries yet.
            </div>
          ) : (
            items.map((e) => (
              <div key={e.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className={ACTION_COLOR[e.action] ?? 'bg-zinc-500/15'}>
                      {e.action}
                    </Badge>
                    <span className="text-muted-foreground">on</span>
                    <span className="font-mono text-xs">{e.resource}</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {e.resourceId.slice(0, 8)}…
                    </code>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    by {e.actor?.name ?? e.actor?.email.split('@')[0] ?? 'system'}
                    {e.actor?.role ? ` (${e.actor.role.toLowerCase().replace('_', ' ')})` : ''}
                    {e.ip ? ` · IP ${e.ip}` : ''}
                    {e.userAgent ? ` · ${e.userAgent.split(' ')[0]}` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(e.createdAt)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={`/admin/audit-logs?${new URLSearchParams({
                ...(actionFilter ? { action: actionFilter } : {}),
                page: String(Math.max(1, page - 1)),
              }).toString()}`}
            >
              ← Prev
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link
              href={`/admin/audit-logs?${new URLSearchParams({
                ...(actionFilter ? { action: actionFilter } : {}),
                page: String(Math.min(totalPages, page + 1)),
              }).toString()}`}
            >
              Next →
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
