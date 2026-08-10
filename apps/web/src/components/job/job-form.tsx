'use client';

import { useActionState, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveJob } from '../../app/(app)/recruiter/jobs/_actions';

export type JobFormValues = {
  id?: string;
  title: string;
  department: string | null;
  location: string | null;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  experienceYears: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  skillsRequired: string[];
  description: string;
  requirements: string | null;
  benefits: string | null;
  deadline: string | null;
  status: 'DRAFT' | 'OPEN' | 'PAUSED' | 'CLOSED' | 'FILLED';
};

export function JobForm({ initial, mode }: { initial: JobFormValues; mode: 'new' | 'edit' }) {
  const router = useRouter();
  const [state, formAction] = useActionState(saveJob, undefined);
  const [pending, startTransition] = useTransition();
  const [skills, setSkills] = useState<string[]>(initial.skillsRequired);
  const [skillDraft, setSkillDraft] = useState('');

  function addSkill(value: string) {
    const next = value.trim();
    if (!next || skills.includes(next) || skills.length >= 15) return;
    setSkills([...skills, next]);
    setSkillDraft('');
  }

  function removeSkill(skill: string) {
    setSkills(skills.filter((s) => s !== skill));
  }

  // Show toast on success (when state changes with no error and we have a job id).
  if (state?.ok && !pending) {
    // Use startTransition to avoid setState during render.
    startTransition(() => {
      toast.success(mode === 'new' ? 'Job created' : 'Job saved');
      router.push(`/recruiter/jobs/${state.jobId}`);
    });
  }

  return (
    <form action={formAction} className="space-y-8">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {state && state.ok === false && state.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" htmlFor="title" required>
              <Input
                id="title"
                name="title"
                defaultValue={initial.title}
                required
                minLength={3}
                maxLength={120}
                placeholder="Senior Full-Stack Engineer"
                aria-invalid={Boolean(
                  state && state.ok === false && state.fieldErrors?.title?.length,
                )}
              />
            </Field>
            <Field label="Department" htmlFor="department">
              <Input
                id="department"
                name="department"
                defaultValue={initial.department ?? ''}
                placeholder="Engineering"
                maxLength={80}
              />
            </Field>
          </div>
          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              name="location"
              defaultValue={initial.location ?? ''}
              placeholder="Remote (Worldwide) · Bengaluru, IN · ..."
              maxLength={120}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Work mode" htmlFor="workMode">
              <select
                id="workMode"
                name="workMode"
                defaultValue={initial.workMode}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">Onsite</option>
              </select>
            </Field>
            <Field label="Employment type" htmlFor="employmentType">
              <select
                id="employmentType"
                name="employmentType"
                defaultValue={initial.employmentType}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Internship</option>
              </select>
            </Field>
            <Field label="Experience level" htmlFor="experienceLevel">
              <select
                id="experienceLevel"
                name="experienceLevel"
                defaultValue={initial.experienceLevel}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="ENTRY">Entry</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Years experience (min)" htmlFor="experienceYears">
              <Input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min={0}
                max={20}
                defaultValue={initial.experienceYears ?? ''}
                placeholder="e.g. 3"
              />
            </Field>
            <Field label="Salary min" htmlFor="salaryMin">
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                min={0}
                defaultValue={initial.salaryMin ?? ''}
                placeholder="90000"
              />
            </Field>
            <Field label="Salary max" htmlFor="salaryMax">
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                min={0}
                defaultValue={initial.salaryMax ?? ''}
                placeholder="130000"
              />
            </Field>
          </div>
          <input type="hidden" name="salaryCurrency" value={initial.salaryCurrency ?? 'USD'} />
          <input type="hidden" name="skillsRequired" value={skills.join('|')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Up to 15 skills. Press Enter to add. We use these to score candidates with the AI match
            engine.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <span className="text-sm text-muted-foreground">No skills yet.</span>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(skillDraft);
                }
              }}
              placeholder="TypeScript"
              maxLength={60}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addSkill(skillDraft)}
              disabled={!skillDraft.trim() || skills.length >= 15}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="About the role" htmlFor="description" required>
            <textarea
              id="description"
              name="description"
              required
              minLength={40}
              maxLength={20_000}
              defaultValue={initial.description}
              rows={6}
              placeholder="You will own..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              aria-invalid={Boolean(
                state && state.ok === false && state.fieldErrors?.description?.length,
              )}
            />
          </Field>
          <Field label="Requirements" htmlFor="requirements">
            <textarea
              id="requirements"
              name="requirements"
              defaultValue={initial.requirements ?? ''}
              rows={4}
              placeholder="One per line."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>
          <Field label="Perks & benefits" htmlFor="benefits">
            <textarea
              id="benefits"
              name="benefits"
              defaultValue={initial.benefits ?? ''}
              rows={3}
              placeholder="Remote-first, equity, 30 days PTO..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application deadline</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Closes on" htmlFor="deadline">
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={initial.deadline ? initial.deadline.split('T')[0] : ''}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="submit" name="action" value="draft" variant="outline" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Save as draft
        </Button>
        <Button type="submit" name="action" value="publish" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {mode === 'new' ? 'Publish job' : 'Save & publish'}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
