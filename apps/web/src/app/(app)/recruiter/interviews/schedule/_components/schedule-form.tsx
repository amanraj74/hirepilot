'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { scheduleInterviewAction, type ScheduleInterviewState } from '../_actions';

type Option = { id: string; label: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? 'Scheduling…' : 'Schedule interview'}
    </Button>
  );
}

export function ScheduleForm({
  applications,
  interviewers,
}: {
  applications: Option[];
  interviewers: Option[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<ScheduleInterviewState, FormData>(
    scheduleInterviewAction,
    undefined,
  );
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([]);

  // On success, surface a toast and redirect.
  if (state?.ok && typeof window !== 'undefined') {
    queueMicrotask(() => {
      toast.success('Interview scheduled and invites sent');
      router.push(`/recruiter/interviews/${state.interviewId}`);
    });
  }

  function toggleInterviewer(id: string) {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state && state.ok === false && state.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidate & type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationId">Candidate</Label>
            <select
              id="applicationId"
              name="applicationId"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Pick a candidate&hellip;
              </option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
            {applications.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No active applications to schedule. Apply for a job first.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Interview type</Label>
              <select
                id="type"
                name="type"
                defaultValue="TECHNICAL"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="PHONE">Phone screen</option>
                <option value="TECHNICAL">Technical</option>
                <option value="HR">HR</option>
                <option value="PANEL">Panel</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMins">Duration (minutes)</Label>
              <Input
                id="durationMins"
                name="durationMins"
                type="number"
                min={15}
                max={240}
                defaultValue={60}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">When & where</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Date & time</Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                name="platform"
                defaultValue="GOOGLE_MEET"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="GOOGLE_MEET">Google Meet</option>
                <option value="ZOOM">Zoom</option>
                <option value="TEAMS">Microsoft Teams</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting link (optional — auto-generated if blank)</Label>
            <Input
              id="meetingLink"
              name="meetingLink"
              type="url"
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location (optional, for onsite)</Label>
            <Input id="location" name="location" placeholder="HQ Conference Room A" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Interviewers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {interviewers.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No interviewer accounts yet. Create an INTERVIEWER-role user in the database or admin
              panel.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interviewers.map((i) => {
                const active = selectedInterviewers.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleInterviewer(i.id)}
                    className={
                      'rounded-md border px-3 py-1.5 text-xs transition-colors ' +
                      (active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground')
                    }
                  >
                    {i.label}
                  </button>
                );
              })}
              <input type="hidden" name="interviewerIds" value={selectedInterviewers.join(',')} />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Pick at least one. They&rsquo;ll get an email + .ics invite and a feedback form.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes for the candidate</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            name="notes"
            rows={4}
            placeholder="What to prepare, topics to cover, who they'll meet, etc."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button asChild variant="ghost" type="button">
          <Link href="/recruiter/interviews">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Cancel
          </Link>
        </Button>
        <SubmitButton />
      </div>
    </form>
  );
}
