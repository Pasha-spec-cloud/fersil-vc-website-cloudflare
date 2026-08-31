'use client';

import { useMemo, useState } from 'react';
import { Company } from '@/types/content';
import { CompanyCard } from '@/components/companies/company-card';
import { cn } from '@/lib/utils';

type CompanyExplorerProps = {
  companies: Company[];
  stageOptions: string[];
};

type SortMode = 'alpha' | 'recent';
type StatusFilter = 'all' | 'active' | 'exited';
const focusAreaOptions = [
  'Robotics & Autonomy',
  'Industrial Intelligence',
  'Edge & Infrastructure',
  'Physical AI'
] as const;

export function CompanyExplorer({ companies, stageOptions }: CompanyExplorerProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('active');
  const [focusArea, setFocusArea] = useState('all');
  const [stage, setStage] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('alpha');

  const filtered = useMemo(() => {
    return companies
      .filter((company) => {
        if (status !== 'all' && company.status !== status) {
          return false;
        }
        if (focusArea !== 'all' && !company.focusAreas.includes(focusArea as Company['focusAreas'][number])) {
          return false;
        }
        if (stage !== 'all' && (company.stage ?? 'unknown') !== stage) {
          return false;
        }
        if (!query) {
          return true;
        }
        const haystack = [company.name, company.tagline, company.stage, company.focusAreas.join(' '), company.officeLocations.join(' ')]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      .sort((a, b) => {
        if (sortMode === 'recent') {
          return (b.firstInvestmentYear ?? 0) - (a.firstInvestmentYear ?? 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [companies, focusArea, query, stage, status, sortMode]);

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-0';
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="space-y-8">
      <div className="panel grid gap-4 rounded-3xl border-white/10 p-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4">
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Search</label>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, focus, or location"
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Focus Area</label>
          <select value={focusArea} onChange={(event) => setFocusArea(event.target.value)} className={`${selectClass} mt-2`}>
            <option value="all">All</option>
            {focusAreaOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Stage</label>
          <select value={stage} onChange={(event) => setStage(event.target.value)} className={`${selectClass} mt-2`}>
            <option value="all">All stages</option>
            {stageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Status</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Exited', value: 'exited' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition',
                  status === option.value
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-white/10 bg-transparent text-muted hover:border-white/30'
                )}
                onClick={() => setStatus(option.value as StatusFilter)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Sort</label>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className={`${selectClass} mt-2`}>
            <option value="alpha">Alphabetical</option>
            <option value="recent">Most recent investment</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          Showing <span className="text-white">{filtered.length}</span> companies
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-muted">
          No companies match your filters yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
