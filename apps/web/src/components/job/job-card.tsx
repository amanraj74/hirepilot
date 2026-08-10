import Link from 'next/link';
import { Briefcase, Building2, MapPin, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  employmentTypeLabel,
  experienceLevelLabel,
  formatRelativeTime,
  formatSalary,
  workModeLabel,
} from '@/lib/utils/format';

type JobCard = {
  id: string;
  title: string;
  location: string | null;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  skillsRequired: string[];
  publishedAt: Date | string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    industry: string | null;
  };
};

export function JobCard({ job }: { job: JobCard }) {
  const publisherInitial = job.company.name.charAt(0).toUpperCase();

  return (
    <Card className="flex flex-col transition-all hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary"
            aria-hidden
          >
            {publisherInitial}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold leading-snug">
              <Link href={`/jobs/${job.id}`} className="hover:underline">
                {job.title}
              </Link>
            </h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{job.company.name}</span>
              {job.company.industry && (
                <span className="text-xs text-muted-foreground/70">· {job.company.industry}</span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="font-normal">
            <Briefcase className="mr-1 h-3 w-3" aria-hidden="true" />
            {employmentTypeLabel(job.employmentType)}
          </Badge>
          <Badge variant="secondary" className="font-normal">
            {experienceLevelLabel(job.experienceLevel)}
          </Badge>
          <Badge variant="outline" className="font-normal">
            <MapPin className="mr-1 h-3 w-3" aria-hidden="true" />
            {workModeLabel(job.workMode)} · {job.location ?? 'Anywhere'}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency ?? 'USD')}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {job.skillsRequired.length > 4 && (
            <span className="text-xs text-muted-foreground">+{job.skillsRequired.length - 4}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Posted {job.publishedAt ? formatRelativeTime(job.publishedAt) : 'recently'}</span>
        <Link href={`/jobs/${job.id}`} className="font-medium text-primary hover:underline">
          View →
        </Link>
      </CardFooter>
    </Card>
  );
}
