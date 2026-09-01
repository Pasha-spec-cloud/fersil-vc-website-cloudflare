'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/companies', label: 'Companies' },
  { href: '/team', label: 'Team' },
  { href: '/news', label: 'News' }
] as const satisfies { href: Route; label: string }[];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/72 backdrop-blur-xl">
      <Container className="flex items-center justify-between gap-5 border-b border-white/5 py-3">
        <Link href="/" aria-label="FerSil Ventures home" className="shrink-0">
          <Image
            src="/media/brand/ferrous-silicon-header-v2.png"
            alt="Ferrous Silicon"
            width={720}
            height={480}
            priority
            className="h-[4.5rem] w-auto rounded-lg border border-white/15 object-contain shadow-[0_10px_32px_rgba(0,0,0,0.28)] sm:h-[5.5rem]"
            sizes="(min-width: 640px) 132px, 108px"
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {navLinks.map((link) => {
            const isRoot = link.href === ('/' as Route);
            const isActive =
              pathname === link.href || (!isRoot && pathname.startsWith(`${link.href}/`));

            return (
              <Link key={link.href} href={link.href as Route} className="relative">
                <span className={isActive ? 'text-white' : ''}>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <ButtonLink href="/contact" variant="accent" size="md">Contact</ButtonLink>
        </div>
      </Container>
    </header>
  );
}
