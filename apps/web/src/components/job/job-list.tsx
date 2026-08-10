import { JobCard } from './job-card';
import type { Prisma } from '@prisma/client';

type JobWithCompany = Prisma.JobGetPayload<{
  include: {
    company: { select: { id: true; name: true; slug: true; logoUrl: true; industry: true } };
  };
}>;

export function JobList({ jobs }: { jobs: JobWithCompany[] }) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
        <h3 className="text-lg font-semibold">No jobs match your filters.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try widening your search or clearing the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={{
            id: job.id,
            title: job.title,
            location: job.location,
            workMode: job.workMode,
            employmentType: job.employmentType,
            experienceLevel: job.experienceLevel,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            skillsRequired: job.skillsRequired,
            publishedAt: job.publishedAt,
            company: job.company,
          }}
        />
      ))}
    </div>
  );
}
