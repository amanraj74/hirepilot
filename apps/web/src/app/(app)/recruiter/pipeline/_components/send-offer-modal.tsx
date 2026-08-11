'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendOfferAction } from '../actions';

type Props = {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  defaultSalaryMin: number | null;
  defaultSalaryMax: number | null;
  defaultLocation: string | null;
  benefits: string[];
  suggestedBenefits: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function FormSubmit({ disabled }: { disabled: boolean }) {
  return (
    <Button type="submit" disabled={disabled}>
      {disabled ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="h-4 w-4" aria-hidden="true" />
      )}
      {disabled ? 'Generating PDF…' : 'Send offer'}
    </Button>
  );
}

export function SendOfferModal({
  applicationId,
  candidateName,
  jobTitle,
  defaultSalaryMin,
  defaultSalaryMax,
  defaultLocation,
  benefits,
  suggestedBenefits,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  // We do the submission manually so we can pass the dynamic benefits list
  // and intercept the response for the toast.
  const [addedBenefits, setAddedBenefits] = useState<string[]>(benefits);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('benefits', addedBenefits.join(','));
    setPending(true);
    setError(null);
    void (async () => {
      const result = await sendOfferAction(undefined, fd);
      setPending(false);
      if (result?.ok) {
        toast.success(`Offer sent to ${candidateName}`);
        onOpenChange(false);
        router.refresh();
      } else if (result && !result.ok) {
        setError(result.error);
      }
    })();
  }

  function addBenefit(b: string) {
    if (!addedBenefits.includes(b)) setAddedBenefits([...addedBenefits, b]);
  }
  function removeBenefit(b: string) {
    setAddedBenefits(addedBenefits.filter((x) => x !== b));
  }

  const defaultSalary = defaultSalaryMin ?? defaultSalaryMax ?? 100000;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-semibold">Send offer to {candidateName}</h2>
            <p className="text-xs text-muted-foreground">For the {jobTitle} role</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <input type="hidden" name="applicationId" value={applicationId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="salaryAmount">Annual salary (USD)</Label>
              <Input
                id="salaryAmount"
                name="salaryAmount"
                type="number"
                min={1000}
                defaultValue={defaultSalary}
                required
              />
              {defaultSalaryMin && defaultSalaryMax && (
                <p className="text-xs text-muted-foreground">
                  Job range: ${defaultSalaryMin.toLocaleString()} – $
                  {defaultSalaryMax.toLocaleString()}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="joiningDate">Joining date</Label>
              <Input id="joiningDate" name="joiningDate" type="date" required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                defaultValue={defaultLocation ?? ''}
                placeholder="Remote / Bengaluru / Hybrid"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Offer expires</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                defaultValue={defaultExpiresAt()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Benefits</Label>
            <div className="flex flex-wrap gap-2">
              {addedBenefits.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => removeBenefit(b)}
                  className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-xs text-primary"
                >
                  {b} <X className="ml-1 inline h-3 w-3" aria-hidden="true" />
                </button>
              ))}
              {addedBenefits.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Pick from the suggestions below
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Tap to add:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedBenefits
                .filter((s) => !addedBenefits.includes(s))
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addBenefit(s)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bodyMarkdown">Personal note (optional)</Label>
            <textarea
              id="bodyMarkdown"
              name="bodyMarkdown"
              rows={3}
              maxLength={2000}
              placeholder="Anything personal you want to add to the letter…"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <FormSubmit disabled={pending} />
          </div>
        </form>
      </div>
    </div>
  );
}

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0] ?? '';
}
