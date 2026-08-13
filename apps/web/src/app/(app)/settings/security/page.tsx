// Settings — security. Currently shows the 2FA panel (enrollment,
// backup codes, disable). Future tabs: connected sessions, audit log
// for this account, account deletion.

import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TwoFactorPanel } from './two-factor-panel';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function SecuritySettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/settings/security');

  const record = await prisma.twoFactorAuth.findUnique({
    where: { userId: session.user.id },
    select: { enabled: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="mt-2 text-muted-foreground">
          Manage two-factor authentication and other account security settings.
        </p>
      </header>

      <TwoFactorPanel initialEnabled={record?.enabled ?? false} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessions & devices</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Active session list and remote-sign-out ship in the next minor release. For now, sign out
          from the sidebar clears the session cookie on this device.
        </CardContent>
      </Card>
    </div>
  );
}
