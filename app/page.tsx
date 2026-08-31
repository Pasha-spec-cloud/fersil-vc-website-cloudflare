import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { MaterialThesis } from '@/components/home/material-thesis';
import { PageHero } from '@/components/layout/page-hero';
import { TeamCard } from '@/components/team/team-card';
import { NewsCard } from '@/components/news/news-card';
import { getContentBundle } from '@/lib/content';

const differentiators = [
  {
    title: 'The Ferrum ↔ Silicon Focus',
    description: 'We invest at the boundary of hardware and software—robotics, industrial intelligence, sensing, and edge infrastructure.'
  },
  {
    title: 'The Diaspora Advantage',
    description: 'We back world-class CEE engineering talent and provide the bridge, capital, and network required to win in global and US markets.'
  },
  {
    title: 'Real-World Deployment Loops',
    description: 'We understand hardware deployment cycles, sensor-data feedback loops, and the unique challenges of scaling physical AI.'
  }
];

export default async function HomePage() {
  const { companies, team, news } = await getContentBundle();
  const activeCompanies = companies.filter((company) => company.status === 'active');
  const representativeLogoSlugs = [
    'openai',
    'mariadb',
    'acronis',
    'nomagic',
    'workerbase',
    'portside',
    'virtuozzo',
    'hover',
    'refurbed',
    'onesoil',
    'xolo',
    'marta'
  ] as const;
  const representativeCompanies = representativeLogoSlugs
    .map((slug) => activeCompanies.find((company) => company.slug === slug))
    .filter((company): company is (typeof activeCompanies)[number] => Boolean(company));
  const teamSpotlight = team
    .filter((m) => !m.hidden && !m.draft && (m.role.toLowerCase().includes('partner') || m.role.toLowerCase().includes('chairman')))
    .slice(0, 4);
  const latestNews = news.slice(0, 3);
  const companiesBySlug = Object.fromEntries(companies.map((company) => [company.slug, company] as const));
  const companiesById = Object.fromEntries(companies.map((company) => [company.id, company] as const));

  const heroStats = [
    { label: 'Initial Check', value: '$1M – $5M' },
    { label: 'Stage', value: 'Seed & Series A' },
    { label: 'Portfolio Companies', value: '22+' },
    { label: 'Strategic Exits', value: '2', detail: 'incl. Neptune → OpenAI' }
  ];

  return (
    <div className="space-y-24 py-16">
      <PageHero tone="home" imageSrc="/media/backgrounds/home-hero.png" imageAlt="FerSil Ventures hero background with robotics lab environment" className="px-8 py-16">
        <Container className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <p className="text-sm uppercase tracking-[0.4em] text-muted">FerSil Ventures</p>
            <h1 className="h1">Where Atoms Meet Bits</h1>
            <p className="max-w-2xl text-lg text-muted">
              FerSil Ventures backs early-stage technical founders building robotics, industrial intelligence, and software rooted in the physical world. We bridge deep Central &amp; Eastern European engineering talent with global scale and US market velocity.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/contact" variant="accent" size="lg">Pitch Us</ButtonLink>
              <ButtonLink href="/companies" size="lg">View Portfolio</ButtonLink>
              <ButtonLink href="/team" variant="ghost" size="lg" className="border border-white/15">Meet the Team</ButtonLink>
            </div>
          </div>
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-muted">Platform Snapshot</p>
            <ul className="mt-6 space-y-5 font-display">
              {heroStats.map((stat) => (
                <li key={stat.label} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-2xl text-white">{stat.value}</span>
                    <span className="text-right text-xs uppercase tracking-[0.25em] text-muted">{stat.label}</span>
                  </div>
                  {'detail' in stat && stat.detail && <p className="mt-1 text-right text-xs text-muted">{stat.detail}</p>}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </PageHero>

      <section>
        <Container>
          <SectionHeading
            kicker="Differentiators"
            title="Why Founders Build With FerSil"
            description="An early-stage partner engineered for complex, physical-world systems."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {differentiators.map((item) => (
              <Card key={item.title} title={item.title} className="h-full">
                <p className="mt-4 text-muted">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <SectionHeading
            kicker="The Thesis"
            title="Iron Meets Silicon"
            description="Iron (Fe) represents the tangible constraints of heavy industry, physical hardware, and atoms. Silicon (Si) embodies computational logic, artificial intelligence, and bits."
          />
          <div className="mt-12">
            <MaterialThesis />
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              kicker="Companies"
              title="Portfolio companies building the future"
              description="Representative active companies across the FerSil network, spanning infrastructure, robotics, industrial systems, AI, and software shaped by the physical world."
            />
            <ButtonLink href="/companies" variant="ghost" className="self-start md:self-auto">Browse companies →</ButtonLink>
          </div>
          <div className="panel mt-12 rounded-3xl border-white/10 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Representative active companies</p>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              {representativeCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.slug}`}
                  className="group relative flex h-24 items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white px-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {company.logo ? (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className={company.slug === 'nomagic' ? 'object-contain p-1 brightness-[0.42] saturate-[1.75] contrast-[1.5] scale-[1.22]' : 'object-contain p-3'}
                      sizes="220px"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-xl text-slate-900">{company.name[0]}</span>
                  )}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">
              22+ portfolio companies across the physical-software frontier.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              kicker="Team"
              title="Built by Operators for Technical Founders"
              description="We combine deep-tech investing experience with hands-on support in US market expansion, technical hiring across CEE corridors, and industrial pilot deployment."
            />
            <ButtonLink href="/team" variant="ghost" className="self-start md:self-auto">Meet the full team →</ButtonLink>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6">
            {teamSpotlight.map((member) => (
              <TeamCard key={member.id} member={member} companiesBySlug={companiesBySlug} variant="compact" companyFilter="active" />
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              kicker="News"
              title="Updates from the FerSil network"
              description="Legacy portfolio news, new milestones, and signals from the systems we believe will matter next."
            />
            <ButtonLink href="/news" variant="ghost" className="self-start md:self-auto">See all news →</ButtonLink>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {latestNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                companyName={item.companyId ? companiesById[item.companyId]?.name : undefined}
                variant="compact"
              />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
