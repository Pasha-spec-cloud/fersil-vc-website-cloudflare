import { NewsManager } from '@/components/admin/news-manager';
import { getCompanies, getNewsItems, getTeamMembers } from '@/lib/content';

export default async function AdminNewsPage() {
  const [news, companies, team] = await Promise.all([
    getNewsItems({ includeDrafts: true }),
    getCompanies({ includeDrafts: true }),
    getTeamMembers({ includeDrafts: true })
  ]);
  return <NewsManager initialNews={news} companies={companies} team={team} />;
}
