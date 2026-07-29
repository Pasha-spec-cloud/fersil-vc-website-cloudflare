'use client';

import { useMemo, useState } from 'react';
import { Company, TeamMember } from '@/types/content';
import { TeamCard } from '@/components/team/team-card';
import { cn } from '@/lib/utils';

type TeamDirectoryProps = {
  team: TeamMember[];
  companiesBySlug: Record<string, Company>;
};

type TeamFilter = 'all' | 'partners' | 'platform';

function categorize(member: TeamMember): TeamFilter {
  const role = member.role.toLowerCase();
  if (role.includes('partner')) return 'partners';
  return 'platform';
}

export function TeamDirectory({ team, companiesBySlug }: TeamDirectoryProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TeamFilter>('all');

  const filtered = useMemo(() => {
    return team.filter((member) => {
      if (filter !== 'all' && categorize(member) !== filter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const portfolioNames = member.companySlugs
        .map((slug) => companiesBySlug[slug]?.name ?? '')
        .join(' ');
      const haystack = `${member.name} ${member.role} ${portfolioNames} ${(member.bio ?? '').slice(0, 160)}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [companiesBySlug, filter, query, team]);

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-0';

  return (
    <div className="space-y-8">
      <div className="panel grid gap-4 rounded-3xl border-white/10 p-6 md:grid-cols-[1fr,auto]">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Search the team</label>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, role, or focus"
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Filter</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Partners', value: 'partners' },
              { label: 'Platform & Ops', value: 'platform' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition',
                  filter === option.value
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 bg-transparent text-muted hover:border-white/30'
                )}
                onClick={() => setFilter(option.value as TeamFilter)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((member) => (
          <TeamCard key={member.id} member={member} companiesBySlug={companiesBySlug} companyFilter="active" />
        ))}
      </div>
    </div>
  );
}
