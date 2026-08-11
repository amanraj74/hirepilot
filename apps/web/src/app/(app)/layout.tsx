import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from 'sonner';
import { prisma } from '@/server/db';

// All authenticated pages must be dynamic — they call auth() which
// queries the DB, and the App Router can't prerender that.
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { name, role } = session.user;
  const displayName = name ?? session.user.email ?? 'there';

  // Fetch unread notification count for the sidebar bell.
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AppSidebar role={role} userName={displayName} unreadCount={unreadCount} />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
