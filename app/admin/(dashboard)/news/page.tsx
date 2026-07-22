import { NewsManager } from '@/components/admin/news-manager';
import { getNewsItems } from '@/lib/content';

export default async function AdminNewsPage() {
  const news = await getNewsItems({ includeDrafts: true });
  return <NewsManager initialNews={news} />;
}
