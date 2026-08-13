'use client';

import { useEffect, useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CodeEditor } from './code-editor';

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

type Attempt = {
  id: string;
  expiresAt: string;
  durationMinutes: number;
};

export function AssessmentTaker({
  attempt,
  questions,
  assignmentId,
}: {
  attempt: Attempt;
  questions: Question[];
  assignmentId: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [now, setNow] = useState<number>(() => Date.now());
  const [submitting, startSubmit] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const submittedRef = useRef(false);

  // Countdown timer.
  const expiresAtMs = new Date(attempt.expiresAt).getTime();
  const remainingMs = Math.max(0, expiresAtMs - now);
  const remainingMin = Math.floor(remainingMs / 60_000);
  const remainingSec = Math.floor((remainingMs % 60_000) / 1000);

  // Tick timer.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Tab switch detection (only when window is hidden).
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === 'hidden' && !submittedRef.current) {
        setTabSwitchCount((c) => c + 1);
        toast.warning('Tab switch detected. This has been recorded.');
      }
    }
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Auto-submit when timer expires.
  useEffect(() => {
    if (remainingMs === 0 && !submittedRef.current) {
      doSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs]);

  async function doSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    startSubmit(async () => {
      try {
        const res = await fetch(`/api/candidate/assessments/attempts/${attempt.id}/submit`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            attemptId: attempt.id,
            tabSwitchCount,
            answers: questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? '' })),
          }),
        });
        if (res.ok) {
          const j = await res.json();
          toast.success(
            `Submitted! Score: ${j.data.percent}% (${j.data.passed ? 'Passed' : 'Below threshold'})`,
          );
          router.push('/candidate/assessments');
        } else {
          const j = await res.json().catch(() => ({}));
          toast.error(j.title ?? 'Submission failed');
        }
      } catch {
        toast.error('Network error');
      }
    });
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Send className="h-8 w-8 text-primary animate-pulse" aria-hidden="true" />
          <p className="text-lg font-semibold">Submitting your answers…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div>
          <h1 className="text-lg font-semibold">Assessment in progress</h1>
          <p className="text-xs text-muted-foreground">{questions.length} questions</p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-sm tabular-nums',
            remainingMin < 5
              ? 'border-destructive bg-destructive/10 text-destructive'
              : 'border-border bg-card',
          )}
        >
          <Clock className="h-4 w-4" aria-hidden="true" />
          {String(remainingMin).padStart(2, '0')}:{String(remainingSec).padStart(2, '0')}
        </div>
      </div>

      {tabSwitchCount > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {tabSwitchCount} tab switch{tabSwitchCount === 1 ? '' : 'es'} detected.
        </div>
      )}

      <ol className="space-y-4">
        {questions.map((q, idx) => (
          <li key={q.id}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Question {idx + 1} of {questions.length} · {q.points} pt
                  {q.points === 1 ? '' : 's'} ·{' '}
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {q.type}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="whitespace-pre-wrap text-sm">{q.prompt}</p>
                {q.type === 'MCQ' && Array.isArray(q.options) && (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label
                        key={i}
                        className={cn(
                          'flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors',
                          answers[q.id] === opt && 'border-primary bg-primary/5',
                        )}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                          className="accent-primary"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type !== 'MCQ' && (
                  <CodeEditor
                    questionType={q.type}
                    language={q.language}
                    value={answers[q.id] ?? ''}
                    starterCode={q.starterCode}
                    onChange={(next) => setAnswers((p) => ({ ...p, [q.id]: next }))}
                  />
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-0 -mx-4 -mb-4 flex items-center justify-end border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backboard-filter]:bg-background/60">
        <Button size="lg" onClick={doSubmit} disabled={submitting || remainingMs === 0}>
          <Send className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Submitting…' : 'Submit assessment'}
        </Button>
      </div>

      {/* Hidden field for form parsing (unused but keeps the form valid) */}
      <input type="hidden" value={assignmentId} readOnly />
    </div>
  );
}
