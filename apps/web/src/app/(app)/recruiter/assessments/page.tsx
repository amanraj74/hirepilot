import Link from 'next/link';
import { Plus, FileText, CheckCircle2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/config';
import { listAssessmentsForRecruiter } from '@/server/services/assessments.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateAssessmentTab } from './_components/create-assessment-tab';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AssessmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login?callbackUrl=/recruiter/assessments');
  if (
    session.user.role !== 'RECRUITER' &&
    session.user.role !== 'HIRING_MANAGER' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/dashboard');
  }

  const items = await listAssessmentsForRecruiter({
    userId: session.user.id,
    companyId: session.user.companyId,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coding assessments</h1>
          <p className="mt-2 text-muted-foreground">
            Build MCQ / code / SQL / debug assessments with countdown timer, tab-switch tracking,
            and auto-grading.
          </p>
        </div>
      </header>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">My assessments ({items.length})</TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="mr-1 h-3 w-3" aria-hidden="true" /> New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  No assessments yet. Build your first one in the "New" tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((a) => (
                <li key={a.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {a.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-zinc-500/15 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            {a.status}
                          </span>
                        )}
                        {a.title}
                      </CardTitle>
                      <CardDescription>
                        {a._count.questions} question{a._count.questions === 1 ? '' : 's'} ·{' '}
                        {a.durationMinutes} min · pass at {a.passingScore}% · {a._count.attempts}{' '}
                        attempt{a._count.attempts === 1 ? '' : 's'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/recruiter/assessments/${a.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        View attempts ({a._count.attempts}) →
                      </Link>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="create">
          <CreateAssessmentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
