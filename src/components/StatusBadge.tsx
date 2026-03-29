import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning' },
  submitted: { label: 'Pending', className: 'bg-warning/15 text-warning' },
  approved: { label: 'Approved', className: 'bg-success/15 text-success' },
  rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive' },
  transferred: { label: 'Transferred', className: 'bg-primary/15 text-primary' },
  active: { label: 'Active', className: 'bg-success/15 text-success' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
