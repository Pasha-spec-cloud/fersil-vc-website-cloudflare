import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { TeamDirectory } from '@/components/team/team-directory';
import { getCompanies, getTeamMembers } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Team',
  description: 'Meet the FerSil Ventures team spanning investing, operations, finance, and LP governance.'
};

export default async function TeamPage() {
  const [team, companies] = await Promise.all([getTeamMembers(), getCompanies()]);
  const companiesBySlug = Object.fromEntries(companies.map((company) => [company.slug, company] as const));

  return (
    <div className="py-16">
      <Container className="space-y-12">
        <PageHero tone="team" imageSrc="/media/backgrounds/team-hero.png" imageAlt="FerSil team page background with robotics and semiconductor workspace" contentClassName="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">Team</p>
          <h1 className="h2">Technical Conviction. Operational Depth.</h1>
          <p className="max-w-3xl text-muted">
            Former founders, engineers, and institutional operators supporting deep-tech builders across Europe and the U.S.
          </p>
        </PageHero>

        <SectionHeading
          kicker="Directory"
          title="Meet the FerSil team"
          description="Search by role, company exposure, or operating focus."
          className="text-center"
        />

        <TeamDirectory team={team} companiesBySlug={companiesBySlug} />
      </Container>
    </div>
  );
}
