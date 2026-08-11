'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const DIMENSIONS = [
  { key: 'technicalSkills', label: 'Technical skills' },
  { key: 'communication', label: 'Communication' },
  { key: 'problemSolving', label: 'Problem solving' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'overallRating', label: 'Overall' },
] as const;

type Dim = (typeof DIMENSIONS)[number]['key'];

const RECOMMENDATIONS = [
  {
    value: 'STRONG_HIRE',
    label: 'Strong hire',
    color: 'bg-green-500/15 text-green-700 dark:text-green-400',
  },
  { value: 'HIRE', label: 'Hire', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  {
    value: 'NO_HIRE',
    label: 'No hire',
    color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  },
  {
    value: 'STRONG_NO_HIRE',
    label: 'Strong no hire',
    color: 'bg-red-500/15 text-red-700 dark:text-red-400',
  },
] as const;

type Rec = (typeof RECOMMENDATIONS)[number]['value'];

export function FeedbackForm({
  interviewId,
  candidateName,
}: {
  interviewId: string;
  candidateName: string;
}) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<Dim, number>>({
    technicalSkills: 3,
    communication: 3,
    problemSolving: 3,
    teamwork: 3,
    leadership: 3,
    overallRating: 3,
  });
  const [recommendation, setRecommendation] = useState<Rec>('HIRE');
  const [comments, setComments] = useState('');
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    try {
      const res = await fetch(`/api/interviewer/feedback/${interviewId}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...ratings,
          recommendation,
          comments: comments.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { title?: string };
        toast.error(j.title ?? 'Failed to submit');
        return;
      }
      toast.success('Feedback submitted');
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-primary" aria-hidden="true" />
          Submit your feedback for {candidateName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {DIMENSIONS.map((dim) => (
            <RatingRow
              key={dim.key}
              label={dim.label}
              value={ratings[dim.key]}
              onChange={(v) => setRatings((r) => ({ ...r, [dim.key]: v }))}
            />
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Recommendation</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {RECOMMENDATIONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRecommendation(r.value)}
                className={cn(
                  'rounded-md border px-3 py-2 text-xs font-semibold transition-colors',
                  recommendation === r.value
                    ? r.color + ' ring-1 ring-primary/40'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Comments (optional)</p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="What went well, what didn't, what should we probe next round?"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center justify-end">
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? 'Submitting…' : 'Submit feedback'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n} of 5`}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-5 w-5',
                n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
              )}
              aria-hidden="true"
            />
          </button>
        ))}
        <span className="ml-2 w-6 text-right font-mono text-sm text-muted-foreground">
          {value}/5
        </span>
      </div>
    </div>
  );
}
