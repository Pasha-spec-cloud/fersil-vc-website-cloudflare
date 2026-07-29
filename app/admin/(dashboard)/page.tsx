import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getContentBundle } from '@/lib/content';

export default async function AdminDashboardPage() {
  const bundle = await getContentBundle({ includeDrafts: true });

  const stats = [
    { label: 'Companies', value: bundle.companies.length, href: '/admin/companies' },
    { label: 'Team Members', value: bundle.team.length, href: '/admin/team' },
    { label: 'News Stories', value: bundle.news.length, href: '/admin/news' }
  ] as const;

  return (
    <div className="space-y-8">
      <Card title="Welcome back" eyebrow="Admin">
        <p className="text-sm text-muted">
          Manage content that powers FerSil Ventures in one place. Use the quick actions below to jump straight to the resource you need to update.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">{stat.label}</p>
              <p className="mt-2 font-display text-4xl text-white">{stat.value}</p>
              <ButtonLink href={stat.href} variant="ghost" className="mt-4 w-full">Manage {stat.label.toLowerCase()}</ButtonLink>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Content tips" eyebrow="Guide">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
          <li>Use draft mode to prepare announcements before publishing.</li>
          <li>Uploading a new logo or portrait automatically stores it under <code>public/media</code>.</li>
          <li>Remember to keep slugs unique—they power SEO-friendly URLs.</li>
        </ul>
      </Card>
    </div>
  );
}
