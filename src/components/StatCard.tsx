import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'primary' | 'warning' | 'success' | 'destructive';
  icon?: React.ReactNode;
}

const colorMap = {
  primary: 'border-l-primary',
  warning: 'border-l-warning',
  success: 'border-l-success',
  destructive: 'border-l-destructive',
};

export function StatCard({ label, value, color = 'primary', icon }: StatCardProps) {
  return (
    <div className={cn('rounded-lg border border-l-4 bg-card p-4 shadow-sm animate-fade-in', colorMap[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold font-heading text-foreground">{value}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}
