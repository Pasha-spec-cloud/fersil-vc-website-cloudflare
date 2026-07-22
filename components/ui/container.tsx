import { cn } from '@/lib/utils';
import { ElementType, ReactNode } from 'react';

interface ContainerProps {
  className?: string;
  children: ReactNode;
  as?: ElementType;
}

export function Container({ as: Component = 'div', className, children }: ContainerProps) {
  const Comp = Component as ElementType;
  return <Comp className={cn('mx-auto w-full max-w-6xl px-6 md:px-10', className)}>{children}</Comp>;
}
