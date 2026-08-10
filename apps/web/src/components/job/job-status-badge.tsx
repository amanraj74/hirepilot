import { Badge } from '@/components/ui/badge';

const STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  OPEN: { label: 'Open', variant: 'default' },
  PAUSED: { label: 'Paused', variant: 'outline' },
  CLOSED: { label: 'Closed', variant: 'outline' },
  FILLED: { label: 'Filled', variant: 'outline' },
};

export function JobStatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  const meta = STATUS_LABELS[status] ?? { label: status, variant: 'outline' as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
