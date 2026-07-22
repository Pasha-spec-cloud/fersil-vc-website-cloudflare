'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
    <header className="sticky top-0 z-30 backdrop-blur-xl">
      <Container className="flex items-center justify-between border-b border-white/5 py-4">
        <Link href="/" className="font-display text-xl text-white flex items-center gap-2">
          <img src="/fersil.svg" alt="FerSil VC" width={24} height={24} className="h-7 w-7 shrink-0 inline-block" loading="eager" decoding="async" />
          <span>FerSil VC</span>
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
          <Button variant="accent" size="md" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
