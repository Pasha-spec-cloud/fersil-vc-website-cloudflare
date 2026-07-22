import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { absoluteUrl, formatDate, slugify, uniqueValues } from '@/lib/utils';

const originalEnv = process.env;

describe('lib/utils', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('slugifies complex text', () => {
    expect(slugify('AI & FinTech / Growth')).toBe('ai-fintech-growth');
    expect(slugify('  Hello--World!!  ')).toBe('hello-world');
  });

  it('formats dates using the provided locale options', () => {
    expect(formatDate('2024-06-01')).toBe('Jun 1, 2024');
    expect(formatDate(new Date('2022-12-31'), { month: 'long', year: 'numeric' })).toBe('December 31, 2022');
  });

  it('deduplicates arrays while preserving insertion order', () => {
    expect(uniqueValues(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('builds absolute URLs using the env fallbacks', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.SITE_URL;
    delete process.env.VERCEL_URL;
    expect(absoluteUrl('/admin')).toBe('http://localhost:3000/admin');

    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    expect(absoluteUrl('team')).toBe('https://example.com/team');

    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.SITE_URL = 'https://internal.example.com';
    expect(absoluteUrl('/news')).toBe('https://internal.example.com/news');

    delete process.env.SITE_URL;
    process.env.VERCEL_URL = 'draft.example.vercel.app';
    expect(absoluteUrl('/companies')).toBe('https://draft.example.vercel.app/companies');
  });
});
