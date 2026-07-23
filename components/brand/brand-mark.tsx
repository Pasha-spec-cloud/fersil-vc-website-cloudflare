import Image from 'next/image';

import { cn } from '@/lib/utils';

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { pixels: 32, imageClass: 'h-8 w-8', textClass: 'text-xl' },
  md: { pixels: 48, imageClass: 'h-12 w-12', textClass: 'text-2xl' },
  lg: { pixels: 72, imageClass: 'h-[4.5rem] w-[4.5rem]', textClass: 'text-3xl' }
} as const;

export function BrandMark({
  className,
  priority = false,
  showName = true,
  size = 'sm'
}: BrandMarkProps) {
  const config = sizes[size];

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Image
        src="/favicon.svg"
        alt=""
        aria-hidden
        width={config.pixels}
        height={config.pixels}
        className={cn('shrink-0', config.imageClass)}
        priority={priority}
      />
      {showName && (
        <span className={cn('font-display font-medium tracking-[-0.03em] text-white', config.textClass)}>
          FerSil VC
        </span>
      )}
    </span>
  );
}
