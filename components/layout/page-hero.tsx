import Image from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeroProps = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PageHero({ imageSrc, imageAlt, children, className, contentClassName }: PageHeroProps) {
  return (
    <section className={cn('panel relative overflow-hidden px-6 py-16 md:px-8', className)}>
      <div className="absolute inset-0">
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,11,14,0.82)_0%,rgba(8,11,14,0.74)_36%,rgba(8,11,14,0.42)_70%,rgba(8,11,14,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,14,0.30)_0%,rgba(8,11,14,0.58)_100%)]" />
      </div>
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </section>
  );
}
