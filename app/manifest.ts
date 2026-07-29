import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FerSil Ventures',
    short_name: 'FerSil',
    description:
      'FerSil Ventures backs founders building at the ferrum-silicon interface.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070b18',
    theme_color: '#070b18',
    icons: [
      {
        src: '/favicon-192x192.png?v=2',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/favicon-512x512.png?v=2',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}
