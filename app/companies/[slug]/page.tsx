import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TeamCard } from '@/components/team/team-card';
import { NewsCard } from '@/components/news/news-card';
import { getCompanies, getCompanyBySlug, getNewsItems, getTeamMembers } from '@/lib/content';
import { absoluteUrl, formatDate } from '@/lib/utils';

type CompanyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const companies = await getCompanies();
  return companies.map((company) => ({ slug: company.slug }));
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return { title: 'Company not found' };
  }

  const description = company.tagline ?? company.description ?? 'Portfolio company backed by FerSil Ventures.';

  return {
    title: company.name,
    description,
    openGraph: {
      title: company.name,
      description,
      url: absoluteUrl(`/companies/${company.slug}`),
      images: company.logo
        ? [
            {
              url: absoluteUrl(company.logo),
              width: 1200,
              height: 630,
              alt: `${company.name} logo`
            }
          ]
        : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: company.name,
      description
    }
  };
}

function normalizeFactTitle(title: string): string {
  return title.replace(/1-st/g, '1st');
}

function extractHtmlLinks(html?: string | null): Array<{ label: string; url: string }> {
  if (!html) return [];
  return Array.from(html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)).map(
    ([, url, label]) => ({
      url: url.replaceAll('&amp;', '&'),
      label: label.replace(/<[^>]+>/g, '').trim() || 'Learn more'
    })
  );
}

function removeHtmlLinks(html?: string | null): string | null {
  if (!html) return null;
  return html.replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '');
}

export default async function CompanyDetailPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const [team, relatedNews] = await Promise.all([
    getTeamMembers(),
    getNewsItems({ companyId: company.id, limit: 3 })
  ]);
  const champions = team.filter((member) => member.companySlugs.includes(company.slug));
  const companyMap = { [company.slug]: company };
  const sourceFacts = company.facts.filter((fact) => fact.items.length > 0);
  const facts = sourceFacts.filter((fact) => !/links?\s*(?:&|and)?\s*social/i.test(fact.title));
  const hasDisclosedStage = Boolean(company.stage && company.stage !== 'Not publicly disclosed');
  const links = [
    company.website ? { label: 'Website', url: company.website } : null,
    company.linkedin ? { label: 'LinkedIn', url: company.linkedin } : null,
    ...company.links,
    ...extractHtmlLinks(company.descriptionHtml),
    ...sourceFacts.flatMap((fact) =>
      fact.items.flatMap((item) => (item.url ? [{ label: item.text, url: item.url }] : []))
    )
  ].filter((link): link is { label: string; url: string } => Boolean(link));
  const uniqueLinks = Array.from(new Map(links.map((link) => [link.url, link])).values());

  const metadataItems = [
    { label: 'Status', value: company.status === 'active' ? 'Active' : 'Exited' },
    { label: 'Investment stage', value: hasDisclosedStage ? company.stage : undefined },
    {
      label: 'First investment',
      value: company.firstInvestmentYear
        ? formatDate(new Date(company.firstInvestmentYear, 0, 1), { year: 'numeric' })
        : undefined
    },
    { label: 'Regions', value: company.officeLocations.join(', ') },
    { label: 'Founders', value: company.founders.join(', ') },
    { label: 'Co-investors', value: company.coInvestors.join(', ') }
  ].filter((item) => Boolean(item.value));

  const heroDescription = company.descriptionHtml ? null : company.description;

  return (
    <div className="py-16">
      <Container className="space-y-16">
        <Link href="/companies" className="text-sm text-muted transition hover:text-white">
          ← Back to companies
        </Link>

        <header className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {hasDisclosedStage && <Badge tone="outline">Investment stage: {company.stage}</Badge>}
              <Badge tone={company.status === 'active' ? 'success' : 'neutral'}>
                {company.status === 'active' ? 'Active' : 'Exited'}
              </Badge>
              {company.firstInvestmentYear && (
                <span className="text-xs uppercase tracking-[0.3em] text-muted">
                  Partnered {company.firstInvestmentYear}
                </span>
              )}
            </div>
            {company.focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {company.focusAreas.map((focusArea) => (
                  <Badge key={focusArea} tone="outline">{focusArea}</Badge>
                ))}
              </div>
            )}
            <div className="flex items-center gap-6">
              {company.logo && (
                <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    fill
                    className={company.slug === 'nomagic' ? 'object-contain p-0 brightness-[0.42] saturate-[1.75] contrast-[1.5] scale-[1.18]' : 'object-contain p-1.5'}
                    sizes="80px"
                  />
                </div>
              )}
              <div>
                <h1 className="h1">{company.name}</h1>
                {company.tagline && <p className="text-lg text-muted">{company.tagline}</p>}
              </div>
            </div>
            {company.descriptionHtml && (
              <div
                className="prose prose-invert max-w-none text-muted"
                dangerouslySetInnerHTML={{ __html: removeHtmlLinks(company.descriptionHtml) ?? '' }}
              />
            )}
            {heroDescription && <p className="text-muted">{heroDescription}</p>}

          </div>

          <aside className="panel rounded-3xl border border-white/10 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Company dossier</p>
            <ul className="mt-4 space-y-3 text-sm">
              {metadataItems.map((item) => (
                <li key={item.label} className="flex flex-col rounded-2xl border border-white/10 p-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">{item.label}</span>
                  <span className="text-white">{item.value}</span>
                </li>
              ))}
            </ul>
          </aside>
        </header>

        {uniqueLinks.length > 0 && (
          <section>
            <SectionHeading kicker="Resources" title="Links and Social Media" />
            <div className="mt-6 flex flex-wrap gap-3">
              {uniqueLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-primary transition hover:border-white/30 hover:text-white"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          </section>
        )}

        {facts.length > 0 && (
          <section>
            <SectionHeading
              kicker="Proof points"
              title="What makes them different"
              description="Signals we track across product, traction, and ecosystem activity."
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {facts.map((fact) => (
                <Card key={fact.title} title={normalizeFactTitle(fact.title)}>
                  <ul className="mt-4 space-y-3 text-sm text-muted">
                    {fact.items.map((item) => (
                      <li key={item.text}>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>
        )}

        {champions.length > 0 && (
          <section className="space-y-6">
            <SectionHeading kicker="Team" title="Deal team & champions" />
            <div className="grid gap-6 md:grid-cols-2">
              {champions.map((member) => (
                <TeamCard key={member.id} member={member} companiesBySlug={companyMap} />
              ))}
            </div>
          </section>
        )}

        {relatedNews.length > 0 && (
          <section className="space-y-6">
            <SectionHeading kicker="Updates" title="Recent headlines" />
            <div className="grid gap-6 md:grid-cols-3">
              {relatedNews.map((item) => (
                <NewsCard key={item.id} item={item} companyName={company.name} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
