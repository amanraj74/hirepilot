import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle2, Clock, Award } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { getAssessmentForRecruiter } from '@/server/services/assessments.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/recruiter/assessments');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  let assessment;
  try {
    assessment = await getAssessmentForRecruiter(id, {
      userId: session.user.id,
      companyId: session.user.companyId,
    });
  } catch {
    notFound();
  }

  const completed = (assessment?.attempts ?? []).filter(
    (a) => a.status === 'GRADED' || a.status === 'SUBMITTED',
  );
  const inProgress = (assessment?.attempts ?? []).filter((a) => a.status === 'IN_PROGRESS');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/recruiter/assessments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All assessments
      </Link>

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{assessment?.title}</h1>
          <Badge variant={assessment?.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {assessment?.status}
          </Badge>
        </div>
        <p className="mt-2 text-muted-foreground">{assessment?.description ?? 'No description.'}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {assessment?._count.questions ?? 0} questions · {assessment?.durationMinutes} min time
          limit · pass at {assessment?.passingScore}%
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-base font-semibold">Attempts</h2>
          <span className="text-xs text-muted-foreground">
            ({completed.length} completed · {inProgress.length} in progress)
          </span>
        </div>
        {completed.length === 0 && inProgress.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Clock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No attempts yet. Assign the assessment to candidates via the pipeline.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {[...completed, ...inProgress].map((a) => {
              const pct =
                a.maxScore && a.maxScore > 0 ? Math.round(((a.score ?? 0) / a.maxScore) * 100) : 0;
              const passed = pct >= (assessment?.passingScore ?? 0);
              return (
                <li key={a.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {a.candidate.name ?? a.candidate.email.split('@')[0]}
                        {a.status === 'GRADED' || a.status === 'SUBMITTED' ? (
                          passed ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" /> Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                              <Clock className="h-3 w-3" /> Below threshold
                            </span>
                          )
                        ) : (
                          <Badge variant="secondary">In progress</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {a.score}/{a.maxScore} points ({pct}%) ·{' '}
                        {a.tabSwitchCount > 0 && (
                          <span className="text-amber-600 dark:text-amber-400">
                            {a.tabSwitchCount} tab switches ·{' '}
                          </span>
                        )}
                        {a.submittedAt
                          ? `submitted ${new Date(a.submittedAt).toLocaleString()}`
                          : `started ${new Date(a.startedAt).toLocaleString()}`}
                      </CardDescription>
                    </CardHeader>
                    {a.answers && Array.isArray(a.answers) && a.answers.length > 0 && (
                      <CardContent>
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium">View answers</summary>
                          <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted/40 p-3 text-xs">
                            {Array.isArray(a.answers) ? JSON.stringify(a.answers, null, 2) : ''}
                          </pre>
                        </details>
                      </CardContent>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
