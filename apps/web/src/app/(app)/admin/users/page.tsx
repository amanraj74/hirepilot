// /admin/users — admin-only user directory with role filter.
// Real Prisma data, server-rendered with role gating.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin/users');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      company: { select: { name: true, slug: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  });

  const totalByRole = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="mt-2 text-muted-foreground">
          {users.length} total ·{' '}
          {Object.entries(totalByRole)
            .map(([r, n]) => `${r.toLowerCase().replace('_', ' ')}: ${n}`)
            .join(' · ')}
        </p>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All accounts</CardTitle>
          <CardDescription>
            Read-only directory — full user CRUD ships post-hackathon.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last sign-in</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={ROLE_COLOR[u.role]}>
                      {u.role.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.company?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {u.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {u.lastLoginAt ? formatRelativeTime(u.lastLoginAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatRelativeTime(u.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
