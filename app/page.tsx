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
    title: 'Ferrum ↔ silicon thesis',
    description: 'We back companies where atoms meet bits: sensing, control systems, robotics, industrial software, and the infrastructure that binds hardware to software.'
  },
  {
    title: 'CEE diaspora angle',
    description: 'Our team has spent years working with CEE talent and global operators, giving FerSil a differentiated view into diaspora founders building category-defining companies far beyond their home markets.'
  },
  {
    title: 'Physical world learning',
    description: 'We care about systems that improve through deployment in the real world, from industrial data loops to autonomy stacks and edge intelligence.'
  }
];

export default async function HomePage() {
  const { companies, team, news } = await getContentBundle();
  const activeCompanies = companies.filter((company) => company.status === 'active');
  const exits = companies.filter((company) => company.status === 'exited').length;
  const geographies = new Set<string>();
  companies.forEach((company) => company.officeLocations.forEach((location) => geographies.add(location)));
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

  const heroStats = [
    { label: 'Active companies', value: activeCompanies.length.toString() },
    { label: 'Strategic exits', value: exits.toString() },
    { label: 'Regions represented', value: geographies.size.toString() }
  ];

  return (
    <div className="space-y-24 py-16">
      <PageHero tone="home" imageSrc="/media/backgrounds/home-hero.png" imageAlt="FerSil VC hero background with robotics lab environment" className="px-8 py-16">
        <Container className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <p className="text-sm uppercase tracking-[0.4em] text-muted">FerSil VC</p>
            <h1 className="h1">Backing the hardware-software interface</h1>
            <p className="max-w-2xl text-lg text-muted">
              FerSil VC invests in technical founders building robotics, industrial intelligence, and software shaped by the physical world. Ferrum ↔ silicon is the industry focus. The team angle is CEE diaspora founders building globally ambitious companies with deep technical roots.
            </p>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/companies" size="lg">View Portfolio</ButtonLink>
              <ButtonLink href="/team" variant="accent" size="lg">Meet the Team</ButtonLink>
            </div>
          </div>
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur">
            <p className="text-sm text-muted">Platform Snapshot</p>
            <ul className="mt-6 space-y-4 text-3xl font-display">
              {heroStats.map((stat) => (
                <li key={stat.label} className="flex items-baseline justify-between">
                  <span>{stat.value}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">{stat.label}</span>
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
            title="What differentiates FerSil"
            description="A focused early-stage platform for founders building real-world systems, technical infrastructure, and robotics-enabled workflows."
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
            kicker="Ferrum ↔ Silicon"
            title="A materials metaphor behind the investment thesis"
            description="We translated the iron-silicon crystal and property studies into an interactive FerSil section to make the thesis more tangible on the page."
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
              {activeCompanies.length}+ active companies across {geographies.size}+ regions, plus {exits}+ strategic exits.
            </p>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              kicker="Team"
              title="Operators for technical funds and technical founders"
              description="FerSil combines investing, LP operations, and company-building support around two lenses: ferrum ↔ silicon as sector focus, and CEE diaspora founders as a sourcing edge."
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
              <NewsCard key={item.id} item={item} variant="compact" />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
