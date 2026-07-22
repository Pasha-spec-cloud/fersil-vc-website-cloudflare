import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { NewsTimeline } from '@/components/news/news-timeline';
import { getNewsItems } from '@/lib/content';

export const metadata: Metadata = {
  title: 'News',
  description: 'Stay current on portfolio news, FerSil VC updates, and perspectives from the investment team.'
};

export default async function NewsPage() {
  const news = await getNewsItems();

  return (
    <div className="py-16">
      <Container className="space-y-12">
        <PageHero imageSrc="/media/backgrounds/news-hero.png" imageAlt="FerSil news page background with robotic semiconductor production line" contentClassName="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">Newsroom</p>
          <h1 className="h2">Updates across the FerSil ecosystem</h1>
          <p className="max-w-3xl text-muted">
            Follow strategic exits, product launches, financing events, and technical milestones across the legacy portfolio.
          </p>
        </PageHero>

        <SectionHeading
          kicker="Timeline"
          title="Filter by year or search"
          description="Scan more than a decade of announcements, sorted instantly by the segments that matter most to you."
          className="text-center"
        />

        <NewsTimeline items={news} />
      </Container>
    </div>
  );
}
