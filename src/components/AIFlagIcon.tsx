import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Circle } from 'lucide-react';

interface AIFlagIconProps {
  flag: 'green' | 'red';
  tooltip: string;
  animate?: boolean;
}

export function AIFlagIcon({ flag, tooltip, animate = false }: AIFlagIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={animate ? (flag === 'green' ? 'animate-scan-green' : 'animate-scan-red') : ''}>
          <Circle
            className={flag === 'green' ? 'fill-success text-success' : 'fill-destructive text-destructive'}
            size={14}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[240px] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
