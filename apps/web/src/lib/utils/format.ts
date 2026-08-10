// Format a salary range as $XXk – $YYk (or $XXk+ if only min is set).
// Inputs are integer dollars (NOT cents) — see Prisma schema convention.

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency = 'USD',
): string {
  if (min === null && max === null) return 'Salary not specified';
  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
      notation: n >= 10_000 ? 'compact' : 'standard',
    }).format(n);
  if (min !== null && min !== undefined && max !== null && max !== undefined)
    return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null && min !== undefined) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMo = Math.round(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  return `${Math.round(diffMo / 12)}y ago`;
}

export function workModeLabel(mode: 'REMOTE' | 'HYBRID' | 'ONSITE'): string {
  return { REMOTE: 'Remote', HYBRID: 'Hybrid', ONSITE: 'Onsite' }[mode];
}

export function employmentTypeLabel(
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN',
): string {
  return {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERN: 'Internship',
  }[type];
}

export function experienceLevelLabel(
  level: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE',
): string {
  return { ENTRY: 'Entry', MID: 'Mid', SENIOR: 'Senior', LEAD: 'Lead', EXECUTIVE: 'Executive' }[
    level
  ];
}
