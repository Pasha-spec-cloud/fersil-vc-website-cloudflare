import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CompanyCard } from '@/components/companies/company-card';
import type { Company } from '@/types/content';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => {
    const { fill, ...rest } = props;
    return <img alt={alt} data-fill={fill ? 'true' : undefined} {...rest} />;
  }
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={typeof href === 'string' ? href : href?.toString()} {...props}>
      {children}
    </a>
  )
}));

const baseCompany: Company = {
  id: 'company-1',
  slug: 'sample-co',
  name: 'Sample Co',
  status: 'active',
  tagline: 'Building the future',
  descriptionHtml: null,
  description: null,
  stage: 'Seed',
  firstInvestmentYear: 2021,
  founders: ['Founder A'],
  ceo: 'Founder A',
  coInvestors: [],
  officeLocations: ['USA'],
  website: 'https://example.com',
  linkedin: 'https://linkedin.com/company/example',
  links: [],
  facts: [],
  logo: null,
  draft: false,
  hidden: false
};

describe('CompanyCard', () => {
  it('renders company metadata and fallback logo', () => {
    render(<CompanyCard company={{ ...baseCompany }} />);
    expect(screen.getByText('Sample Co')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Seed')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders provided logo image', () => {
    render(<CompanyCard company={{ ...baseCompany, logo: '/logo.png' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Sample Co');
  });
});
