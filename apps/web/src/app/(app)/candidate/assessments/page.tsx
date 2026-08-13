import Link from 'next/link';
import { ChevronRight, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { listMyAttemptsWithAssessments } from '@/server/services/assessments.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function MyAssessmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/candidate/assessments');
  if (session.user.role !== 'CANDIDATE') redirect('/dashboard');

  const attempts = await listMyAttemptsWithAssessments(session.user.id);

  const pending = attempts.filter((a) => a.status === 'IN_PROGRESS');
  const completed = attempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Coding assessments</h1>
        <p className="mt-2 text-muted-foreground">
          Take assessments assigned by recruiters. Each has a time limit and a countdown timer.
          Switching tabs is tracked.
        </p>
      </header>

      {pending.length === 0 && completed.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              No assessments assigned yet. Recruiters will assign them at specific interview rounds.
            </p>
          </CardContent>
        </Card>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Pending</h2>
          <ul className="space-y-3">
            {pending.map((a) => (
              <li key={a.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{a.assessment.title}</CardTitle>
                    <CardDescription>
                      {a.assessment._count.questions} question
                      {a.assessment._count.questions === 1 ? '' : 's'} ·{' '}
                      {a.assessment.durationMinutes} min time limit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild>
                      <Link href={`/candidate/assessments/${a.assessmentId}/take`}>
                        {a.startedAt ? 'Resume attempt' : 'Start assessment'}
                        <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold tracking-tight">Completed</h2>
          <ul className="space-y-3">
            {completed.map((a) => {
              const pct =
                a.maxScore && a.maxScore > 0 ? Math.round((a.score ?? 0) / a.maxScore) * 100 : 0;
              const passed = pct >= a.assessment.passingScore;
              return (
                <li key={a.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {a.assessment.title}
                        {passed ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                            <Clock className="h-3 w-3" /> Below threshold
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {a.score}/{a.maxScore} points ({pct}%) · passing {a.assessment.passingScore}
                        %
                        {a.tabSwitchCount > 0 && (
                          <span className="ml-2 text-xs"> · {a.tabSwitchCount} tab switches</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
