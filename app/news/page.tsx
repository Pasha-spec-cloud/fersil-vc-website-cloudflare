import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { NewsTimeline } from '@/components/news/news-timeline';
import { getCompanies, getNewsItems } from '@/lib/content';

export const metadata: Metadata = {
  title: 'News',
  description: 'Stay current on portfolio news, FerSil Ventures updates, and perspectives from the investment team.'
};

export default async function NewsPage() {
  const [news, companies] = await Promise.all([getNewsItems(), getCompanies()]);
  const companyNamesById = Object.fromEntries(
    companies.map((company) => [company.id, company.name])
  );

  return (
    <div className="py-16">
      <Container className="space-y-12">
        <PageHero tone="news" imageSrc="/media/backgrounds/news-hero.png" imageAlt="FerSil news page background with robotic semiconductor production line" contentClassName="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">Newsroom</p>
          <h1 className="h2">Updates across the FerSil ecosystem</h1>
          <p className="max-w-3xl text-muted">
            Follow strategic exits, product launches, financing events, and technical milestones across the portfolio.
          </p>
        </PageHero>

        <SectionHeading
          kicker="Timeline"
          title="Filter by year or search"
          description="Scan updates from active portfolio companies, organized by year and searchable by company or topic."
          className="text-center"
        />

        <NewsTimeline items={news} companyNamesById={companyNamesById} />
      </Container>
    </div>
  );
}
