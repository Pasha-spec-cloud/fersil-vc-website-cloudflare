import { describe, expect, it } from 'vitest';

import { isPublicNewsItem } from '@/lib/content';

describe('public news cutoff', () => {
  it('hides news published before 2021', () => {
    expect(isPublicNewsItem({ publishedAt: '2020-12-31T23:59:59.000Z' })).toBe(false);
  });

  it('shows news published from 2021 onward', () => {
    expect(isPublicNewsItem({ publishedAt: '2021-01-01T00:00:00.000Z' })).toBe(true);
    expect(isPublicNewsItem({ publishedAt: '2026-03-15T00:00:00.000Z' })).toBe(true);
  });
});
