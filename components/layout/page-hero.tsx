import Image from 'next/image';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type PageHeroProps = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
  tone?: 'home' | 'companies' | 'team' | 'news' | 'contact';
  className?: string;
  contentClassName?: string;
};

export function PageHero({
  imageSrc,
  imageAlt,
  children,
  tone = 'home',
  className,
  contentClassName
}: PageHeroProps) {
  return (
    <section
      className={cn('page-hero panel relative overflow-hidden px-6 py-16 md:px-8', className)}
      data-tone={tone}
    >
      <div className="page-hero-media absolute inset-0">
        <Image src={imageSrc} alt={imageAlt} fill className="page-hero-image object-cover" priority sizes="100vw" />
        <div className="page-hero-overlay absolute inset-0" />
        <div className="page-hero-vignette absolute inset-0" />
      </div>
      <div className={cn('relative z-10', contentClassName)}>{children}</div>
    </section>
  );
}
