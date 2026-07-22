import './globals.css';

import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export const metadata: Metadata = {
  title: {
    default: 'FerSil VC | Hardware, Software, and the Physical World',
    template: '%s | FerSil VC'
  },
  description:
    'FerSil VC backs founders building at the ferrum-silicon interface: robotics, industrial systems, and software that learns from the physical world.',
  metadataBase: new URL('https://fersil.vc'),
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
      { url: '/fersil.svg', type: 'image/svg+xml', sizes: 'any' }
    ],
    shortcut: '/fersil.svg',
    apple: '/fersil.svg'
  }
};

export const viewport: Viewport = {
  themeColor: '#040714'
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
