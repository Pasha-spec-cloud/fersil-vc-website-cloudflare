import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'success' | 'warning' | 'neutral' | 'outline';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-primary/15 text-[#d7edf0] border border-primary/40',
  warning: 'bg-accent/15 text-[#eff3f6] border border-accent/40',
  neutral: 'bg-white/5 text-white border border-white/10',
  outline: 'border border-white/20 text-muted'
};

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
