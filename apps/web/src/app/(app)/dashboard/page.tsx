import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/server/auth';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Role-aware routing — every role lands on its own home.
  const role = session.user.role;
  if (role === 'RECRUITER') redirect('/recruiter/dashboard');
  if (role === 'HIRING_MANAGER') redirect('/hiring-manager/dashboard');
  if (role === 'INTERVIEWER') redirect('/interviewer/dashboard');
  if (role === 'ADMIN') redirect('/admin/dashboard');

  // Candidate landing — show their applications + matches.
  return <CandidateHome />;
}

function CandidateHome() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to HirePilot</h1>
        <p className="mt-2 text-muted-foreground">
          Browse open roles, track your applications, and let our deterministic AI show you where
          you match best.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/jobs"
          className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">Browse jobs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            See all open roles with filters for work mode, type, and experience level.
          </p>
        </Link>
        <Link
          href="/applications"
          className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">My applications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track where each application stands in the pipeline.
          </p>
        </Link>
      </div>
    </div>
  );
}
