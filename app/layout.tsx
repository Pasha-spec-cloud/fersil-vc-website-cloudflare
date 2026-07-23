import '@fontsource-variable/ibm-plex-sans';
import '@fontsource-variable/space-grotesk';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

// Admin edits live in R2; dynamic rendering keeps every Worker isolate current.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'FerSil VC | Hardware, Software, and the Physical World',
    template: '%s | FerSil VC'
  },
  description:
    'FerSil VC backs founders building at the ferrum-silicon interface: robotics, industrial systems, and software that learns from the physical world.',
  metadataBase: new URL('https://fersil.vc'),
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'FerSil VC',
    description:
      'FerSil VC backs founders building at the ferrum-silicon interface: robotics, industrial systems, and software that learns from the physical world.',
    url: 'https://fersil.vc',
    siteName: 'FerSil VC',
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fersilvc'
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon-512x512.png', type: 'image/png', sizes: '512x512' }
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }]
  }
};

export const viewport: Viewport = {
  themeColor: '#070b18'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white">
        <div className="min-h-screen bg-grid-slate bg-grid">
          <div className="mx-auto max-w-7xl px-4 sm:px-8">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
