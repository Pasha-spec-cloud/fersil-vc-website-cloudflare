import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: string;
  eyebrow?: string;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, eyebrow, children, className }: CardProps) {
  return (
    <div className={cn('panel relative overflow-hidden p-6 shadow-soft', className)}>
      {eyebrow && <p className="text-sm uppercase tracking-[0.2em] text-muted">{eyebrow}</p>}
      {title && <h3 className="mt-2 font-display text-2xl text-white">{title}</h3>}
      {children}
      <div className="pointer-events-none absolute inset-0 border border-white/5" aria-hidden />
    </div>
  );
}
