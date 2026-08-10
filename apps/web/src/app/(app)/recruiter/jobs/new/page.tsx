import type { Metadata } from 'next';
import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { JobForm } from '@/components/job/job-form';

export const metadata: Metadata = {
  title: 'Post a job · HirePilot',
};

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Post a new job</h1>
        <p className="mt-2 text-muted-foreground">
          Fill in the basics, add required skills, then publish. You can save as a draft and come
          back later.
        </p>
      </header>

      {!session.user.companyId && (
        <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          You need to associate with a company before posting jobs. Please complete your company
          profile first.
        </div>
      )}

      <JobForm
        mode="new"
        initial={{
          title: '',
          department: null,
          location: null,
          workMode: 'REMOTE',
          employmentType: 'FULL_TIME',
          experienceLevel: 'MID',
          experienceYears: null,
          salaryMin: null,
          salaryMax: null,
          salaryCurrency: 'USD',
          skillsRequired: [],
          description: '',
          requirements: null,
          benefits: null,
          deadline: null,
          status: 'DRAFT',
        }}
      />
    </div>
  );
}
