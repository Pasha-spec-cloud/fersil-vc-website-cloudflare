'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { logout } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/companies', label: 'Companies' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/security', label: 'Security' }
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Admin</p>
          <p className="font-display text-2xl text-white">Content Console</p>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="md" type="submit">
            Sign out
          </Button>
        </form>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(`${link.href}`));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition',
                isActive ? 'border-primary bg-primary/20 text-white' : 'border-white/10 text-muted hover:border-white/30'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
