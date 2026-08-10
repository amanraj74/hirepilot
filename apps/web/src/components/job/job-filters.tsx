'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const WORK_MODES = [
  { value: '', label: 'Any' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'Onsite' },
];

const EMPLOYMENT_TYPES = [
  { value: '', label: 'Any' },
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Internship' },
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Any' },
  { value: 'ENTRY', label: 'Entry-level' },
  { value: 'MID', label: 'Mid-level' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

export function JobFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  const values = {
    q: sp.get('q') ?? '',
    location: sp.get('location') ?? '',
    workMode: sp.get('workMode') ?? '',
    employmentType: sp.get('employmentType') ?? '',
    experienceLevel: sp.get('experienceLevel') ?? '',
  };

  function update(name: string, value: string) {
    const next = new URLSearchParams(sp);
    if (value) next.set(name, value);
    else next.delete(name);
    next.delete('page');
    startTransition(() => router.push(`/jobs?${next.toString()}`));
  }

  function clear() {
    startTransition(() => router.push('/jobs'));
  }

  const hasFilters = Object.values(values).some((v) => v !== '');

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5">
      <div className="space-y-2">
        <Label htmlFor="q">Search</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="q"
            name="q"
            defaultValue={values.q}
            placeholder="Title, skill, keyword"
            className="pl-9"
            onChange={(e) => update('q', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={values.location}
          placeholder="City, country, remote"
          onChange={(e) => update('location', e.target.value)}
        />
      </div>

      <FilterGroup
        label="Work mode"
        name="workMode"
        value={values.workMode}
        options={WORK_MODES}
        onChange={update}
      />
      <FilterGroup
        label="Employment type"
        name="employmentType"
        value={values.employmentType}
        options={EMPLOYMENT_TYPES}
        onChange={update}
      />
      <FilterGroup
        label="Experience level"
        name="experienceLevel"
        value={values.experienceLevel}
        options={EXPERIENCE_LEVELS}
        onChange={update}
      />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        disabled={!hasFilters || pending}
        onClick={clear}
      >
        {pending ? 'Updating…' : 'Clear all filters'}
      </Button>
    </div>
  );
}

function FilterGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (name: string, value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value || 'any'}
            type="button"
            onClick={() => onChange(name, opt.value === value ? '' : opt.value)}
            className={
              'inline-flex items-center rounded-md border px-3 py-1 text-xs transition-colors ' +
              (opt.value === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
