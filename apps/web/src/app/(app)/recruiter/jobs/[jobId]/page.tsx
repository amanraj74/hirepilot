import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { auth } from '@/server/auth';
import { getRecruiterJob } from '@/server/services/jobs.service';
import { JobForm } from '@/components/job/job-form';
import { JobStatusBadge } from '@/components/job/job-status-badge';
import { JobActions } from './_components/job-actions';

export const metadata: Metadata = {
  title: 'Edit job · HirePilot',
};

export const dynamic = 'force-dynamic';

export default async function EditJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }
  const { jobId } = await params;

  let job;
  try {
    job = await getRecruiterJob(jobId, {
      userId: session.user.id,
      companyId: session.user.companyId,
    });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/recruiter/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            {job._count.applications} active{' '}
            {job._count.applications === 1 ? 'applicant' : 'applicants'}
          </p>
        </div>
        <JobActions jobId={job.id} />
      </header>

      <JobForm
        mode="edit"
        initial={{
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          workMode: job.workMode,
          employmentType: job.employmentType,
          experienceLevel: job.experienceLevel,
          experienceYears: job.experienceYears,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          skillsRequired: job.skillsRequired,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          deadline: job.deadline ? job.deadline.toISOString() : null,
          status: job.status,
        }}
      />
    </div>
  );
}
