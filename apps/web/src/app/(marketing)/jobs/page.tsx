import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { jobListQuerySchema } from '@/lib/validations/jobs';
import { JobList } from '@/components/job/job-list';
import { JobFilters } from '@/components/job/job-filters';

export const metadata: Metadata = {
  title: 'Browse jobs · HirePilot',
  description: 'Find your next role. Filter by work mode, type, and seniority.',
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  // Normalize: take the first if array, undefined if missing
  const params = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );

  const parsed = jobListQuerySchema.safeParse(params);
  const filters = parsed.success ? parsed.data : { page: 1, limit: 20 };

  const where: Prisma.JobWhereInput = {
    status: 'OPEN',
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: 'insensitive' } },
            { description: { contains: filters.q, mode: 'insensitive' } },
            { department: { contains: filters.q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(filters.location ? { location: { contains: filters.location, mode: 'insensitive' } } : {}),
    ...(filters.workMode ? { workMode: filters.workMode } : {}),
    ...(filters.employmentType ? { employmentType: filters.employmentType } : {}),
    ...(filters.experienceLevel ? { experienceLevel: filters.experienceLevel } : {}),
    ...(filters.minSalary ? { salaryMax: { gte: filters.minSalary } } : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        company: { select: { id: true, name: true, slug: true, logoUrl: true, industry: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Browse jobs</h1>
        <p className="mt-2 text-muted-foreground">
          {total} open {total === 1 ? 'role' : 'roles'} from companies hiring now.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Suspense fallback={<div className="h-64 rounded-xl border border-border bg-card/40" />}>
            <JobFilters />
          </Suspense>
        </aside>

        <section>
          <JobList jobs={jobs} />

          {total > filters.limit && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <PageLink page={filters.page - 1} disabled={filters.page <= 1} searchParams={sp}>
                ← Previous
              </PageLink>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {Math.max(1, Math.ceil(total / filters.limit))}
              </span>
              <PageLink
                page={filters.page + 1}
                disabled={filters.page * filters.limit >= total}
                searchParams={sp}
              >
                Next →
              </PageLink>
            </nav>
          )}

          <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <h2 className="text-lg font-semibold">Not seeing the right role?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a candidate account and we&rsquo;ll match you to roles that fit your skills.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PageLink({
  page,
  disabled,
  searchParams,
  children,
}: {
  page: number;
  disabled: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
  children: React.ReactNode;
}) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (k === 'page') continue;
    const val = Array.isArray(v) ? v[0] : v;
    if (val) next.set(k, val);
  }
  next.set('page', String(page));

  if (disabled) {
    return (
      <span className="inline-flex h-9 items-center rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground/50 cursor-not-allowed">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={`/jobs?${next.toString()}`}
      className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm hover:bg-muted"
    >
      {children}
    </Link>
  );
}
