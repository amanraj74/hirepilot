import type { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/server/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signOutAction } from './actions';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null; // middleware would have redirected; this is defense in depth
  }

  const { name, email, role } = session.user;

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {name ?? 'there'}</h1>
            <p className="text-muted-foreground">
              {email} · role: <code className="text-xs">{role}</code>
            </p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Day 0 foundation complete</CardTitle>
            <CardDescription>
              Monorepo, Next.js 15, Prisma schema (25 models), Auth.js, edge middleware, and
              Postgres are wired up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Day 1 (auth flows, landing page, companies + jobs CRUD) is next.</p>
            <p>Real role-specific dashboards will replace this placeholder once features ship.</p>
            <p>
              Public landing:{' '}
              <Link href="/" className="text-primary hover:underline">
                /
              </Link>{' '}
              · Sign out via the button above.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
