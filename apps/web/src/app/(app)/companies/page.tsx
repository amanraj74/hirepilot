// Company page for the recruiter's own company. Shows the company
// profile, active jobs, and team members. Server Component, reads
// from Prisma, scoped to the authenticated user's companyId.

import Link from 'next/link';
import { Building2, Briefcase, Globe, MapPin, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { employmentTypeLabel, formatRelativeTime, workModeLabel } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function CompanyPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/companies');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              No company connected
            </CardTitle>
            <CardDescription>
              Your account isn&apos;t linked to a company yet. Ask an admin to associate you with
              one before you can post jobs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const [company, members, jobs] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        industry: true,
        size: true,
        description: true,
        officeLocations: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        lastLoginAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    }),
    prisma.job.findMany({
      where: { companyId, deletedAt: null },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        workMode: true,
        employmentType: true,
        status: true,
        publishedAt: true,
        _count: { select: { applications: { where: { deletedAt: null } } } },
      },
      orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }],
    }),
  ]);

  if (!company) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Company not found</CardTitle>
            <CardDescription>
              The company linked to your account no longer exists. Contact an admin to fix the
              association.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const officeLocations = Array.isArray(company.officeLocations)
    ? (company.officeLocations as unknown as string[])
    : [];

  const openJobs = jobs.filter((j) => j.status === 'OPEN').length;
  const totalMembers = members.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Building2 className="h-7 w-7 text-primary" aria-hidden="true" />
            {company.name}
          </h1>
          {company.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">{company.description}</p>
          )}
        </div>
        <Button asChild>
          <Link href="/recruiter/jobs/new">
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            Post a job
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Open jobs
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs}</div>
            <p className="mt-1 text-xs text-muted-foreground">{jobs.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Team members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="mt-1 text-xs text-muted-foreground">linked to this company</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Industry
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold">{company.industry ?? '—'}</div>
            <p className="mt-1 text-xs text-muted-foreground">{company.size ?? 'size not set'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Offices
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-semibold">{officeLocations.length || '—'}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {officeLocations[0] ?? 'no locations listed'}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Active jobs</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/recruiter/jobs">All jobs</Link>
          </Button>
        </div>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No jobs posted yet. Click <strong>Post a job</strong> to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {jobs.slice(0, 8).map((j) => (
                <div key={j.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <Link href={`/recruiter/jobs/${j.id}`} className="font-medium hover:underline">
                      {j.title}
                    </Link>
                    {j.department && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{j.department}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {workModeLabel(j.workMode)} · {j.location ?? 'Anywhere'} ·{' '}
                      {employmentTypeLabel(j.employmentType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={j.status === 'OPEN' ? 'default' : 'secondary'}>
                      {j.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {j._count.applications} applicant{j._count.applications === 1 ? '' : 's'}
                    </span>
                    {j.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        · {formatRelativeTime(j.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Team members</h2>
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {members.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name ?? m.email.split('@')[0]}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{m.role.toLowerCase().replace('_', ' ')}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {m.lastLoginAt
                      ? `Active ${formatRelativeTime(m.lastLoginAt)}`
                      : 'Never signed in'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
