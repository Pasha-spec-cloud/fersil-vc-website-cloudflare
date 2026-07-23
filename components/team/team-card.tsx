import Image from 'next/image';
import { Company, TeamMember } from '@/types/content';
import { Card } from '@/components/ui/card';

type TeamCardProps = {
  member: TeamMember;
  companiesBySlug?: Record<string, Company>;
  variant?: 'default' | 'compact';
  companyFilter?: 'all' | 'active';
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function TeamCard({
  member,
  companiesBySlug = {},
  variant = 'default',
  companyFilter = 'all'
}: TeamCardProps) {
  const portfolio = member.companySlugs
    .map((slug) => companiesBySlug[slug])
    .filter((company): company is Company => Boolean(company))
    .filter((company) => companyFilter !== 'active' || company.status === 'active')
    .map((company) => company.name)
    .slice(0, variant === 'compact' ? 4 : Number.MAX_SAFE_INTEGER);

  return (
    <Card className="flex h-full flex-col gap-4 rounded-3xl border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-4">
        {member.headshotUrl ? (
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10">
            <Image src={member.headshotUrl} alt={member.name} fill className="object-cover" sizes="64px" />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 font-display text-xl">
            {getInitials(member.name)}
          </div>
        )}
        <div>
          <p className="font-display text-2xl text-white flex items-center gap-2">
            {member.name}
            {(member.role.toLowerCase().includes('partner') || member.role.toLowerCase().includes('chairman')) && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-accent">
                {member.role.toLowerCase().includes('chairman') ? 'Chairman' : 'Partner'}
              </span>
            )}
          </p>
          <p className="text-sm uppercase tracking-[0.25em] text-muted">{member.role}</p>
        </div>
      </div>
      {variant === 'default' && member.bio && <p className="text-sm text-muted whitespace-pre-line">{member.bio}</p>}
      {portfolio.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            {companyFilter === 'active' ? 'Current companies' : 'Select companies'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {portfolio.map((name) => (
              <span key={name} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
      {member.socialLinks.length > 0 && (
        <div className="mt-auto flex gap-3 text-sm text-muted">
          {member.socialLinks.slice(0, 2).map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer noopener" className="transition hover:text-white">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
