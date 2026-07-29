import type { Metadata } from 'next';
import { BrandMark } from '@/components/brand/brand-mark';
import { PageHero } from '@/components/layout/page-hero';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Office address and contact information for FerSil Ventures.'
};

export default function ContactPage() {
  const addressLines = [
    'FerSil Ventures',
    'Kurfürstendamm 70',
    '10709 Berlin, Germany'
  ];
  const mapQuery = encodeURIComponent('Kurfürstendamm 70, 10709 Berlin, Germany');

  return (
    <div className="py-16">
      <Container className="space-y-10">
        <PageHero tone="contact" imageSrc="/media/backgrounds/contact-hero.png" imageAlt="FerSil contact page background with advanced industrial facility corridor" contentClassName="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">Contact</p>
          <h1 className="h2">Get in touch</h1>
          <p className="max-w-3xl text-muted">Find our office location and the best way to reach our team.</p>
        </PageHero>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="panel border-white/10 p-6">
              <BrandMark size="lg" />
              <p className="mt-4 max-w-md text-sm text-muted">
                Ferrum meets silicon: investing across physical intelligence, industrial systems, and the CEE-US founder corridor.
              </p>
            </div>

            <div>
              <h3 className="font-display text-xl text-white">Office</h3>
              <address className="mt-2 not-italic text-muted">
                {addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </address>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-xl text-white">Contacts</h3>
              <p className="text-muted">
                For entrepreneur / investment inquiries:{' '}
                <a href="mailto:team@fersil.vc" className="text-primary">team@fersil.vc</a>
              </p>
              <p className="text-muted">
                For LP, governance, and operating inquiries:{' '}
                <a href="mailto:operations@fersil.vc" className="text-primary">operations@fersil.vc</a>
              </p>
            </div>

            <div className="text-sm text-muted">
              <p>
                For other inquiries, please use the contacts above.
              </p>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
              <div className="aspect-[4/3] w-full">
                <iframe
                  title="FerSil Ventures — Berlin Office"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              Map for reference only. Please confirm meeting details with your FerSil contact.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
