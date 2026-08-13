import { redirect } from 'next/navigation';
import { headers as nextHeaders } from 'next/headers';
import { startAttempt, getAttemptForCandidate } from '@/server/services/assessments.service';
import { AssessmentTaker } from '@/components/assessment/assessment-taker';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Question = {
  id: string;
  type: 'MCQ' | 'CODE' | 'SQL' | 'DEBUG';
  prompt: string;
  options: string[] | null;
  starterCode: string | null;
  language: string | null;
  points: number;
  orderIndex: number;
  timeLimitSecs: number | null;
};

export default async function TakeAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assessmentId } = await params;

  const hdrs = await nextHeaders();
  const cookie = hdrs.get('cookie') ?? '';
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/candidate/assessments/${assessmentId}/start`, {
    method: 'POST',
    headers: { cookie },
    cache: 'no-store',
  });
  if (!res.ok) redirect('/candidate/assessments');
  const json = (await res.json()) as { data?: { attemptId?: string; expiresAt?: string } };
  if (!json.data?.attemptId) redirect('/candidate/assessments');

  const { auth } = await import('@/server/auth');
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/candidate/assessments');

  let attempt;
  try {
    attempt = await getAttemptForCandidate(json.data.attemptId, session.user.id);
  } catch {
    redirect('/candidate/assessments');
  }

  if (attempt.expiresAt && new Date(attempt.expiresAt).getTime() < Date.now()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Clock className="h-8 w-8 text-destructive" aria-hidden="true" />
          <h2 className="text-lg font-semibold">This attempt has expired</h2>
          <p className="text-sm text-muted-foreground">Each assessment allows only one attempt.</p>
        </CardContent>
      </Card>
    );
  }

  const questions: Question[] = (attempt.assessment.questions ?? []).map((q) => ({
    id: q.id,
    type: q.type as Question['type'],
    prompt: q.prompt,
    options: Array.isArray(q.options) ? (q.options as unknown as string[]) : null,
    starterCode: q.starterCode,
    language: q.language,
    points: q.points,
    orderIndex: q.orderIndex,
    timeLimitSecs: q.timeLimitSecs,
  })) as Question[];

  return (
    <AssessmentTaker
      attempt={{
        id: attempt.id,
        expiresAt: attempt.expiresAt ? attempt.expiresAt.toISOString() : new Date().toISOString(),
        durationMinutes: attempt.assessment.durationMinutes,
      }}
      questions={questions}
      assignmentId={assessmentId}
    />
  );
}
