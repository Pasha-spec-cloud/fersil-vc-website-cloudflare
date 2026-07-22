import { TeamManager } from '@/components/admin/team-manager';
import { getCompanies, getTeamMembers } from '@/lib/content';

export default async function AdminTeamPage() {
  const [team, companies] = await Promise.all([
    getTeamMembers({ includeDrafts: true }),
    getCompanies({ includeDrafts: true })
  ]);

  return <TeamManager initialTeam={team} companies={companies} />;
}
