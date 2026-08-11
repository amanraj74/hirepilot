import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarClock, Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import {
  listInterviewsForRecruiter,
  type RecruiterInterviewListItem,
} from '@/server/services/interviews.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { prisma } from '@/server/db';

export const metadata: Metadata = {
  title: 'Interviews · HirePilot',
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TYPE_LABEL: Record<string, string> = {
  PHONE: 'Phone',
  TECHNICAL: 'Technical',
  HR: 'HR',
  PANEL: 'Panel',
  ONSITE: 'Onsite',
};

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  COMPLETED: 'bg-green-500/15 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
  NO_SHOW: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default async function RecruiterInterviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/recruiter/interviews');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const interviews: RecruiterInterviewListItem[] = await listInterviewsForRecruiter({
    userId: session.user.id,
    companyId: session.user.companyId,
  });

  // For the schedule form: fetch applications to interview (across all jobs).
  const apps = await prisma.application.findMany({
    where: { deletedAt: null, stage: { notIn: ['REJECTED', 'HIRED'] } },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      job: { select: { id: true, title: true, company: { select: { name: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });
  const eligibleApps = apps
    .filter((a) => a.jobId && a.candidateId)
    .map((a) => ({
      id: a.id,
      label: `${a.candidate.name ?? a.candidate.email.split('@')[0]} — ${a.job.title}${a.job.company ? ` @ ${a.job.company.name}` : ''}`,
    }));

  // For interviewer selection.
  const interviewers = await prisma.user.findMany({
    where: { role: { in: ['INTERVIEWER', 'HIRING_MANAGER', 'ADMIN'] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  });
  const interviewerOptions = interviewers.map((i) => ({
    id: i.id,
    label: `${i.name ?? i.email.split('@')[0]} (${i.role.toLowerCase().replace('_', ' ')})`,
  }));

  const upcoming = interviews.filter((iv) => iv.scheduledAt.getTime() > Date.now());
  const past = interviews.filter((iv) => iv.scheduledAt.getTime() <= Date.now());

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="mt-2 text-muted-foreground">
            {interviews.length} total · {upcoming.length} upcoming. Schedule phone, technical, or HR
            interviews and we&rsquo;ll email everyone an .ics invite.
          </p>
        </div>
        <Button asChild>
          <Link href="/recruiter/interviews/schedule">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Schedule interview
          </Link>
        </Button>
      </header>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CalendarClock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              No interviews yet. Schedule one to get started.
            </p>
            <Button asChild>
              <Link href="/recruiter/interviews/schedule">Schedule the first interview</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && <Section title="Upcoming" interviews={upcoming} />}
          {past.length > 0 && <Section title="Past" interviews={past} muted />}
        </div>
      )}

      {/* Hidden form context for the schedule page (no UI here, just data pass). */}
      <input type="hidden" data-apps={JSON.stringify(eligibleApps)} />
      <input type="hidden" data-interviewers={JSON.stringify(interviewerOptions)} />
    </div>
  );
}

function Section({
  title,
  interviews,
  muted = false,
}: {
  title: string;
  interviews: RecruiterInterviewListItem[];
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <ul className="space-y-2">
        {interviews.map((iv) => (
          <li key={iv.id}>
            <Link
              href={`/recruiter/interviews/${iv.id}`}
              className={`group block rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md ${muted ? 'opacity-60' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">
                      {iv.candidate.name ?? iv.candidate.email.split('@')[0]} ·{' '}
                      {TYPE_LABEL[iv.type] ?? iv.type} · {iv.job.title}
                    </h3>
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[iv.status] ?? 'bg-muted'}`}
                    >
                      {iv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {iv.scheduledAt.toLocaleString()} · {iv.durationMins} min ·{' '}
                    {iv.platform.replace('_', ' ')}
                    {iv.interviewers.length > 0 &&
                      ` · with ${iv.interviewers.map((i) => i.name ?? i.email.split('@')[0]).join(', ')}`}
                  </p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {iv.type}
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
