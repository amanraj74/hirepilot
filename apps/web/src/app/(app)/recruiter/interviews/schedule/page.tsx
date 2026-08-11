import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarPlus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { prisma } from '@/server/db';
import { ScheduleForm } from './_components/schedule-form';

export const metadata: Metadata = { title: 'Schedule interview · HirePilot' };
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function ScheduleInterviewPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/recruiter/interviews/schedule');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const [apps, interviewers] = await Promise.all([
    prisma.application.findMany({
      where: { deletedAt: null, stage: { notIn: ['REJECTED', 'HIRED'] } },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        job: { select: { title: true, company: { select: { name: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: { in: ['INTERVIEWER', 'HIRING_MANAGER', 'ADMIN'] } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const applicationOptions = apps
    .filter((a) => a.candidateId && a.jobId)
    .map((a) => ({
      id: a.id,
      label: `${a.candidate.name ?? a.candidate.email.split('@')[0]} — ${a.job.title}${a.job.company ? ` @ ${a.job.company.name}` : ''}`,
    }));

  const interviewerOptions = interviewers.map((i) => ({
    id: i.id,
    label: `${i.name ?? i.email.split('@')[0]} (${i.role.toLowerCase().replace('_', ' ')})`,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/recruiter/interviews"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to interviews
      </Link>

      <header>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <CalendarPlus className="h-7 w-7 text-primary" aria-hidden="true" />
          Schedule interview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a candidate, set the time, choose interviewers. We&rsquo;ll email everyone an .ics
          invite and create in-app notifications.
        </p>
      </header>

      <ScheduleForm applications={applicationOptions} interviewers={interviewerOptions} />
    </div>
  );
}
