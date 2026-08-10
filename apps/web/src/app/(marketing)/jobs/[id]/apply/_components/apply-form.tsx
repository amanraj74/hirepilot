'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { applyToJobAction, type ApplyState } from '../actions';

const MIN_CHARS = 40;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? 'Submitting…' : 'Submit application'}
    </Button>
  );
}

export function ApplyForm({ jobId, candidateName }: { jobId: string; candidateName: string }) {
  const initialLetter = `Hi team,\n\nI'm excited to apply for this role. My background aligns well with what you're looking for, and I'd love to discuss how I can contribute.\n\nBest,\n${candidateName}`;
  const [letter, setLetter] = useState(initialLetter);
  const [state, formAction] = useActionState<ApplyState, FormData>(applyToJobAction, undefined);

  const charsLeft = MIN_CHARS - letter.length;
  const tooShort = charsLeft > 0;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="jobId" value={jobId} />

      {state && state.ok === false && state.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="coverLetter">Cover letter</Label>
          <span className={`text-xs ${tooShort ? 'text-destructive' : 'text-muted-foreground'}`}>
            {tooShort ? `${charsLeft} more characters required` : `${letter.length} characters`}
          </span>
        </div>
        <textarea
          id="coverLetter"
          name="coverLetter"
          required
          minLength={MIN_CHARS}
          maxLength={5_000}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          rows={10}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">
          Introduce yourself. Mention specific projects, technologies, and why this role fits.{' '}
          <Link href="/profile" className="text-primary hover:underline">
            Edit profile
          </Link>{' '}
          to reuse a saved resume once resume upload ships.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button asChild variant="ghost" type="button">
          <Link href={`/jobs/${jobId}`}>← Back to job</Link>
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
