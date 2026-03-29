import { Check, Clock, Circle, X } from 'lucide-react';
import { ApprovalStep } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border-2',
                step.status === 'approved' && 'border-success bg-success/10',
                step.status === 'rejected' && 'border-destructive bg-destructive/10',
                step.status === 'pending' && 'border-warning bg-warning/10',
                step.status === 'not_reached' && 'border-muted bg-muted',
              )}>
                {step.status === 'approved' && <Check size={14} className="text-success" />}
                {step.status === 'rejected' && <X size={14} className="text-destructive" />}
                {step.status === 'pending' && <Clock size={14} className="text-warning" />}
                {step.status === 'not_reached' && <Circle size={10} className="text-muted-foreground" />}
              </div>
              {!isLast && <div className={cn('w-0.5 flex-1 min-h-[24px]', step.status === 'approved' ? 'bg-success/40' : 'bg-border')} />}
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium">Step {i + 1}: {step.role} {step.approverName ? `(${step.approverName})` : ''}</p>
              {step.status === 'approved' && (
                <p className="text-xs text-success">✓ Approved {step.comment ? `— "${step.comment}"` : ''} {step.timestamp ? `— ${step.timestamp}` : ''}</p>
              )}
              {step.status === 'rejected' && (
                <p className="text-xs text-destructive">✗ Rejected {step.comment ? `— "${step.comment}"` : ''} {step.timestamp ? `— ${step.timestamp}` : ''}</p>
              )}
              {step.status === 'pending' && <p className="text-xs text-warning">⏳ Waiting...</p>}
              {step.status === 'not_reached' && <p className="text-xs text-muted-foreground">Not reached yet</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
