import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  className?: string;
}

export function SectionHeading({ kicker, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {kicker && <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted">{kicker}</p>}
      <h2 className="font-display text-3xl text-white sm:text-4xl">{title}</h2>
      {description && <p className="max-w-2xl text-base text-muted">{description}</p>}
    </div>
  );
}
