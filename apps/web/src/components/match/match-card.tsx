import { Check, X, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MatchResult } from '@/server/ai/match-scorer';

export function MatchCard({
  result,
  hasResume,
}: {
  result: MatchResult | null;
  hasResume: boolean;
}) {
  // Empty state — no resume yet
  if (!hasResume) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            AI match score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Upload a resume to see your match score with full breakdown.</p>
          <a
            href="/profile"
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Upload resume →
          </a>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            AI match score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Match unavailable for this role. Try uploading a more recent resume.</p>
        </CardContent>
      </Card>
    );
  }

  const { score, strongSkills, missingSkills, weakAreas, recommendations, breakdown } = result;

  const color =
    score >= 75
      ? 'text-green-600 dark:text-green-400'
      : score >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  const ringColor =
    score >= 75 ? 'stroke-green-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

  // SVG ring math: radius 28, circumference = 2 * pi * r ≈ 175.93
  const CIRC = 175.93;
  const dashOffset = CIRC * (1 - score / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
          AI match score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 64 64" className="h-20 w-20 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                strokeWidth="6"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className={ringColor}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <span className={cn('text-xl font-bold tabular-nums', color)}>{score}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className={cn('text-sm font-semibold', color)}>
              {score >= 75 ? 'Strong match' : score >= 50 ? 'Moderate match' : 'Stretch role'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Skill overlap <span className="font-mono">{breakdown.skillOverlap}%</span> ·
              Experience <span className="font-mono">{breakdown.experienceScore}%</span> · Education{' '}
              <span className="font-mono">{breakdown.educationScore}%</span>
            </p>
          </div>
        </div>

        {strongSkills.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Check className="h-3 w-3 text-green-600" aria-hidden="true" />
              Strong skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {strongSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-700 dark:text-green-400"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <X className="h-3 w-3 text-red-600" aria-hidden="true" />
              Missing skills
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-700 dark:text-red-400"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {weakAreas.length > 0 && (
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <AlertCircle className="h-3 w-3 text-amber-600" aria-hidden="true" />
              Areas to strengthen
            </p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {weakAreas.map((w, i) => (
                <li key={i}>· {w}</li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-primary" aria-hidden="true" />
              Recommendations
            </p>
            <ul className="space-y-0.5 text-xs">
              {recommendations.map((r, i) => (
                <li key={i}>· {r}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
