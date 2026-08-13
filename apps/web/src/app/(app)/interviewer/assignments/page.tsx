// /interviewer/assignments — interviewer's queue of interviews.
// Shows upcoming + completed assignments, with scorecard state.

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { prisma } from '@/server/db';
import { listInterviewsForInterviewer } from '@/server/services/interviews.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  COMPLETED: 'bg-green-500/15 text-green-700 dark:text-green-400',
  CANCELLED: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
  NO_SHOW: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

export default async function InterviewerAssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/interviewer/assignments');
  if (session.user.role !== 'INTERVIEWER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const interviews = await listInterviewsForInterviewer(session.user.id);

  // Pull feedback counts to know which need scoring.
  const ids = interviews.map((iv) => iv.id);
  const feedbackById = await prisma.interviewFeedback.findMany({
    where: { interviewId: { in: ids }, interviewerId: session.user.id },
    select: { interviewId: true },
  });
  const scoredSet = new Set(feedbackById.map((f) => f.interviewId));

  const now = Date.now();
  const upcoming = interviews.filter((iv) => iv.scheduledAt.getTime() > now);
  const past = interviews.filter((iv) => iv.scheduledAt.getTime() <= now);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">My interviews</h1>
        <p className="mt-2 text-muted-foreground">
          {interviews.length} total · {upcoming.length} upcoming · {past.length} completed
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No upcoming interviews.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((iv) => (
              <InterviewCard
                key={iv.id}
                interview={iv}
                scored={scoredSet.has(iv.id)}
                isPast={false}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold tracking-tight">Completed</h2>
        {past.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-muted-foreground">No past interviews yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {past.map((iv) => (
              <InterviewCard key={iv.id} interview={iv} scored={scoredSet.has(iv.id)} isPast />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InterviewCard({
  interview,
  scored,
  isPast,
}: {
  interview: Awaited<ReturnType<typeof listInterviewsForInterviewer>>[number];
  scored: boolean;
  isPast: boolean;
}) {
  const needsScorecard = isPast && !scored;
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {interview.candidate.name ?? interview.candidate.email.split('@')[0]}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                · {interview.type.toLowerCase()} · {interview.job.title}
              </span>
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {interview.scheduledAt.toLocaleString()} · {interview.durationMins} min ·{' '}
              {interview.platform.replace('_', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={STATUS_COLOR[interview.status] ?? 'bg-zinc-500/15'}>
              {interview.status.toLowerCase()}
            </Badge>
            {scored && <Badge variant="secondary">Scored</Badge>}
            {needsScorecard && (
              <Badge variant="default" className="bg-primary">
                Action needed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {isPast ? 'Conducted' : 'Scheduled'} {formatRelativeTime(interview.scheduledAt)}
          </p>
          <Button asChild size="sm" variant={needsScorecard ? 'default' : 'outline'}>
            <Link href={`/recruiter/interviews/${interview.id}`}>
              {needsScorecard ? 'Submit scorecard' : 'View'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
