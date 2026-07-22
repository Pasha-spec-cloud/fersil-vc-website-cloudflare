import Image from 'next/image';
import Link from 'next/link';
import { Company } from '@/types/content';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CompanyCardProps = {
  company: Company;
  variant?: 'default' | 'compact';
};

const statusMap: Record<Company['status'], { label: string; tone: 'success' | 'neutral' }> = {
  active: { label: 'Active', tone: 'success' },
  exited: { label: 'Exited', tone: 'neutral' }
};

const logoTileClassBySlug: Partial<Record<Company['slug'], string>> = {
  nomagic: 'bg-white',
  workerbase: 'bg-white',
  'specter-automation': 'bg-white',
  yazen: 'bg-white'
};

const logoImageClassBySlug: Partial<Record<Company['slug'], string>> = {
  nomagic: 'p-0 brightness-[0.42] saturate-[1.75] contrast-[1.5] scale-[1.22]',
  'specter-automation': 'p-0.5 scale-[1.08]',
  yazen: 'p-0.5 scale-[1.08]',
  workerbase: 'p-0 scale-[1.34]'
};

export function CompanyCard({ company, variant = 'default' }: CompanyCardProps) {
  const status = statusMap[company.status];
  const logoTileClass = logoTileClassBySlug[company.slug] ?? 'bg-white';
  const logoImageClass = logoImageClassBySlug[company.slug] ?? 'p-1';
  const content = (
    <Card className="h-full cursor-pointer rounded-3xl border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <div className="flex items-start gap-4">
        {company.logo ? (
          <div className={cn('relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm', logoTileClass)}>
            <Image
              src={company.logo}
              alt={company.name}
              fill
              className={cn('object-contain', logoImageClass)}
              sizes="56px"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white font-display text-xl text-slate-900 shadow-sm">
            {company.name[0]}
          </div>
        )}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {status && <Badge tone={status.tone}>{status.label}</Badge>}
          </div>
          <h3 className="font-display text-2xl text-white">{company.name}</h3>
          {company.tagline && <p className="text-sm text-muted">{company.tagline}</p>}
          {variant === 'default' && company.officeLocations.length > 0 && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {company.officeLocations.join(' • ')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  return <Link href={`/companies/${company.slug}`}>{content}</Link>;
}
