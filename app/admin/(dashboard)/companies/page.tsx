import { CompaniesManager } from '@/components/admin/companies-manager';
import { getCompanies } from '@/lib/content';

export default async function AdminCompaniesPage() {
  const companies = await getCompanies({ includeDrafts: true });
  return <CompaniesManager initialCompanies={companies} />;
}
