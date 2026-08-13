// /admin/companies — admin-only directory of companies with counts.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminCompaniesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin/companies');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      website: true,
      industry: true,
      size: true,
      createdAt: true,
      _count: { select: { users: true, jobs: { where: { deletedAt: null } } } },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="mt-2 text-muted-foreground">
          {companies.length} compan{companies.length === 1 ? 'y' : 'ies'} on the platform.
        </p>
      </header>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">No companies yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Industry</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 text-right font-medium">Members</th>
                  <th className="px-4 py-3 text-right font-medium">Jobs</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          {c.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.industry ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.size ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">{c._count.users}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline">{c._count.jobs}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeTime(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
