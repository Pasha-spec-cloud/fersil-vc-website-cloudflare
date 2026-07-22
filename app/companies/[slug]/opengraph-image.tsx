import { ImageResponse } from 'next/og';
import { getCompanyBySlug } from '@/lib/content';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default async function CompanyOgImage({ params }: { params: { slug: string } }) {
  const company = await getCompanyBySlug(params.slug);
  const title = company?.name ?? 'FerSil VC';
  const subtitle = company?.tagline ?? 'Portfolio highlight backed by FerSil VC';
  const stage = company?.stage ?? (company?.status === 'exited' ? 'Strategic exit' : 'Portfolio company');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #020617 100%)',
          color: '#f8fafc',
          padding: '72px',
          fontFamily: 'Space Grotesk, Inter, sans-serif'
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#94a3b8' }}>FerSil VC</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 24, margin: 0, color: '#A7F3D0' }}>{stage}</p>
          <h1 style={{ fontSize: 72, margin: '12px 0 0 0', lineHeight: 1.1 }}>{title}</h1>
          <p style={{ fontSize: 32, marginTop: 16, color: '#cbd5f5', maxWidth: '90%' }}>{subtitle}</p>
        </div>
        {company?.officeLocations && (
          <div style={{ fontSize: 22, color: '#94a3b8' }}>Offices: {company.officeLocations.join(' • ')}</div>
        )}
      </div>
    ),
    size
  );
}
