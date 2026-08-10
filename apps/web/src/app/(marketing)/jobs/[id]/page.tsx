import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Globe, MapPin, Wallet } from 'lucide-react';
import { prisma } from '@/server/db';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  employmentTypeLabel,
  experienceLevelLabel,
  formatRelativeTime,
  formatSalary,
  workModeLabel,
} from '@/lib/utils/format';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: { title: true, company: { select: { name: true } } },
  });
  if (!job) return { title: 'Job not found · HirePilot' };
  return {
    title: `${job.title} · ${job.company.name} · HirePilot`,
    description: `${job.title} at ${job.company.name}. Apply on HirePilot.`,
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, status: 'OPEN' },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          website: true,
          industry: true,
          size: true,
          description: true,
          socialLinks: true,
          officeLocations: true,
        },
      },
    },
  });

  if (!job) notFound();

  const requirements = job.requirements?.split('\n').filter(Boolean) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All jobs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <article>
          <header className="space-y-4">
            <div className="flex items-start gap-4">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary/10 text-xl font-bold text-primary"
                aria-hidden="true"
              >
                {job.company.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{job.title}</h1>
                <p className="mt-1 text-base text-muted-foreground">
                  <Link href={`/jobs?company=${job.company.slug}`} className="hover:underline">
                    {job.company.name}
                  </Link>
                  {job.department && <> · {job.department}</>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary">{employmentTypeLabel(job.employmentType)}</Badge>
              <Badge variant="secondary">{experienceLevelLabel(job.experienceLevel)}</Badge>
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
                {workModeLabel(job.workMode)} · {job.location ?? 'Anywhere'}
              </Badge>
              {job.experienceYears !== null &&
                job.experienceYears !== undefined &&
                job.experienceYears > 0 && (
                  <Badge variant="outline">{job.experienceYears}+ yrs experience</Badge>
                )}
              <Badge variant="outline">
                <Wallet className="mr-1 h-3 w-3" aria-hidden="true" />
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency ?? 'USD')}
              </Badge>
            </div>
          </header>

          <section className="prose prose-sm dark:prose-invert mt-8 max-w-none">
            <h2 className="text-lg font-semibold">About the role</h2>
            <p className="mt-2 whitespace-pre-line text-foreground/90">{job.description}</p>
          </section>

          {requirements.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">What we&rsquo;re looking for</h2>
              <ul className="mt-3 space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.benefits && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold">Perks &amp; benefits</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{job.benefits}</p>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-semibold">Required skills</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.skillsRequired.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Ready to apply?
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href={`/jobs/${job.id}/apply`}>Apply for this role</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">Create account</Link>
              </Button>
              <p className="pt-2 text-xs text-muted-foreground">
                Posting {job.publishedAt ? `${formatRelativeTime(job.publishedAt)}` : 'recently'}
                {job.deadline && (
                  <>
                    {' · '}
                    Closes{' '}
                    {new Date(job.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-semibold">{job.company.name}</span>
              </div>
              {job.company.industry && (
                <p className="text-xs text-muted-foreground">
                  {job.company.industry}
                  {job.company.size ? ` · ${job.company.size} employees` : ''}
                </p>
              )}
            </CardHeader>
            {job.company.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{job.company.description}</p>
              </CardContent>
            )}
            {Array.isArray(job.company.officeLocations) &&
              job.company.officeLocations.length > 0 && (
                <CardContent className="border-t border-border pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    Locations
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {job.company.officeLocations.map((loc) => (
                      <li key={loc as string}>{loc as string}</li>
                    ))}
                  </ul>
                </CardContent>
              )}
            {job.company.website && (
              <CardContent className="border-t border-border pt-4">
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Company website →
                </a>
              </CardContent>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
