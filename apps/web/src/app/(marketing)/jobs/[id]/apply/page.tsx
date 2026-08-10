import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft, Briefcase, MapPin, Wallet } from 'lucide-react';
import { authOptions } from '@/server/auth/config';
import { prisma } from '@/server/db';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  employmentTypeLabel,
  experienceLevelLabel,
  formatSalary,
  workModeLabel,
} from '@/lib/utils/format';
import { ApplyForm } from './_components/apply-form';

export const metadata: Metadata = {
  title: 'Apply · HirePilot',
};

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Redirect unauth users to login with callback back here.
  if (!session?.user) {
    redirect(`/login?callbackUrl=/jobs/${id}/apply`);
  }

  // Recruiters/admins shouldn't apply to jobs.
  if (session.user.role !== 'CANDIDATE') {
    redirect('/dashboard');
  }

  const job = await prisma.job.findFirst({
    where: { id, status: 'OPEN' },
    include: {
      company: { select: { name: true, logoUrl: true } },
    },
  });
  if (!job) notFound();

  // If they already applied, send them straight to their applications list.
  const existing = await prisma.application.findFirst({
    where: { jobId: id, candidateId: session.user.id, deletedAt: null },
    select: { id: true, stage: true, appliedAt: true },
  });
  if (existing) {
    redirect('/applications?already=1');
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_320px] md:py-14">
      <div>
        <Link
          href={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to job
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">Apply for this role</h1>
        <p className="mt-1 text-muted-foreground">
          You&rsquo;re applying as{' '}
          <span className="font-medium text-foreground">
            {session.user.name ?? session.user.email}
          </span>
          . A short cover letter is all we need — you can attach a resume once that feature ships.
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Cover letter</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplyForm jobId={id} candidateName={session.user.name ?? 'there'} />
          </CardContent>
        </Card>
      </div>

      <aside className="md:sticky md:top-20 md:self-start">
        <Card>
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Applying to
            </p>
            <CardTitle className="mt-1 text-lg">{job.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              {job.company.name}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {workModeLabel(job.workMode)} · {job.location ?? 'Anywhere'}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency ?? 'USD')}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <Badge variant="secondary">{employmentTypeLabel(job.employmentType)}</Badge>
              <Badge variant="secondary">{experienceLevelLabel(job.experienceLevel)}</Badge>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
