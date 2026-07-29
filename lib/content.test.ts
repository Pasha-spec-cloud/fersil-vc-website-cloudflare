import { describe, expect, it } from 'vitest';

import { hasPublicNewsAssociations, isPublicNewsItem } from '@/lib/content';
import type { Company, NewsItem, TeamMember } from '@/types/content';

describe('public news cutoff', () => {
  it('hides news published before 2021', () => {
    expect(isPublicNewsItem({ publishedAt: '2020-12-31T23:59:59.000Z' })).toBe(false);
  });

  it('shows news published from 2021 onward', () => {
    expect(isPublicNewsItem({ publishedAt: '2021-01-01T00:00:00.000Z' })).toBe(true);
    expect(isPublicNewsItem({ publishedAt: '2026-03-15T00:00:00.000Z' })).toBe(true);
  });
});

describe('public news associations', () => {
  const company = {
    id: 'company-active',
    status: 'active',
    draft: false,
    hidden: false
  } as Company;
  const member = {
    id: 'team-active',
    draft: false,
    hidden: false
  } as TeamMember;
  const item = {
    companyId: company.id,
    teamMemberIds: [member.id]
  } as NewsItem;

  it('shows news linked to an active company and active team members', () => {
    expect(hasPublicNewsAssociations(item, [company], [member])).toBe(true);
  });

  it('hides news when its company is exited or hidden', () => {
    expect(hasPublicNewsAssociations(item, [{ ...company, status: 'exited' }], [member])).toBe(false);
    expect(hasPublicNewsAssociations(item, [{ ...company, hidden: true }], [member])).toBe(false);
  });

  it('hides news tagged to an unavailable team member', () => {
    expect(hasPublicNewsAssociations(item, [company], [{ ...member, hidden: true }])).toBe(false);
    expect(hasPublicNewsAssociations(item, [company], [])).toBe(false);
  });

  it('hides unassociated legacy news without throwing', () => {
    expect(hasPublicNewsAssociations({ companyId: null, teamMemberIds: [] }, [company], [member])).toBe(false);
  });
});
