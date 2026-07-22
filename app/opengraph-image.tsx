import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #030712 0%, #111827 65%, #0f172a 100%)',
          color: '#f8fafc',
          padding: '72px',
          fontFamily: 'Space Grotesk, Inter, sans-serif'
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#94a3b8' }}>FerSil VC</div>
        <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ fontSize: 72, margin: 0, lineHeight: 1.1 }}>Hardware, software, and the physical world</h1>
          <p style={{ fontSize: 28, marginTop: 16, color: '#cbd5f5' }}>
            FerSil backs robotics, industrial intelligence, and real-world learning systems.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 24, color: '#A7F3D0' }}>
          <span>70+ Companies</span>
          <span>20 Exits</span>
          <span>15 Years</span>
        </div>
      </div>
    ),
    size
  );
}
