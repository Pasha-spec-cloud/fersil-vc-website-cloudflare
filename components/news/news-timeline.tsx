'use client';

import { useMemo, useState } from 'react';
import { NewsItem } from '@/types/content';
import { NewsCard } from '@/components/news/news-card';
import { formatDate } from '@/lib/utils';

type NewsTimelineProps = {
  items: NewsItem[];
};

type NewsWithMeta = {
  item: NewsItem;
  year: number;
};

export function NewsTimeline({ items }: NewsTimelineProps) {
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');

  const entries = useMemo<NewsWithMeta[]>(
    () =>
      items.map((item) => ({
        item,
        year: new Date(item.publishedAt).getFullYear()
      })),
    [items]
  );

  const years = useMemo(() => {
    const set = new Set(entries.map((entry) => entry.year.toString()));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const itemYear = entry.year.toString();
      if (year !== 'all' && itemYear !== year) {
        return false;
      }
      if (!query) {
        return true;
      }
      const haystack = `${entry.item.title} ${entry.item.summary ?? ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [entries, query, year]);

  const grouped = filtered.reduce<Record<string, NewsItem[]>>((acc, entry) => {
    const key = entry.year.toString();
    acc[key] = acc[key] ?? [];
    acc[key].push(entry.item);
    return acc;
  }, {});

  const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted focus:border-primary focus:outline-none focus:ring-0';

  return (
    <div className="space-y-10">
      <div className="panel grid gap-4 rounded-3xl border-white/10 p-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Search updates</label>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Look for a company or keyword"
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-muted">Year</label>
          <select value={year} onChange={(event) => setYear(event.target.value)} className={`${inputClass} mt-2`}>
            <option value="all">All years</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-muted">
          No news matches yet. Try another combination.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.keys(grouped)
            .sort((a, b) => Number(b) - Number(a))
            .map((group) => (
              <section key={group} className="space-y-4">
                <h3 className="text-sm uppercase tracking-[0.3em] text-muted">{group}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {grouped[group].map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted">
          Covering stories from {formatDate(entries.at(-1)?.item.publishedAt ?? entries[0].item.publishedAt, { year: 'numeric' })} to {formatDate(entries[0].item.publishedAt, { year: 'numeric' })}
        </p>
      )}
    </div>
  );
}
