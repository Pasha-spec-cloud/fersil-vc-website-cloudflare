import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { CompanyExplorer } from '@/components/companies/company-explorer';
import { getCompanies } from '@/lib/content';
import { uniqueValues } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Companies',
  description: 'Explore the legacy FerSil VC portfolio across infrastructure, automation, applied AI, and frontier software.'
};

export default async function CompaniesPage() {
  const companies = await getCompanies();
  const stageOptions = uniqueValues(
    companies
      .map((company) => company.stage)
      .filter((stage): stage is string => Boolean(stage))
  ).sort((a, b) => a.localeCompare(b));

  return (
    <div className="py-16">
      <Container className="space-y-12">
        <PageHero tone="companies" imageSrc="/media/backgrounds/companies-hero.png" imageAlt="FerSil companies page background with robotics and automation lab" contentClassName="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">Portfolio</p>
          <h1 className="h2">Companies forging new categories</h1>
          <p className="max-w-3xl text-muted">
            FerSil reuses the legacy portfolio set while reframing the investment story around infrastructure, robotics, autonomy, physical-world learning, and CEE diaspora founder ambition.
          </p>
        </PageHero>

        <SectionHeading
          kicker="Explorer"
          title="Filter by thesis, status, and stage"
          description="Use the filters below to navigate the full legacy company set by industry, geography, or stage."
          className="text-center"
        />

        <CompanyExplorer companies={companies} stageOptions={stageOptions} />
      </Container>
    </div>
  );
}
