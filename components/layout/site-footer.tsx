import { BrandMark } from '@/components/brand/brand-mark';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

const supportLogos = [
  { src: '/media/support/ebrd.png', alt: 'European Bank for Reconstruction and Development' },
  { src: '/media/support/european-commission.png', alt: 'European Commission' },
  { src: '/media/support/eif.png', alt: 'European Investment Fund' }
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10 text-sm text-muted">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:items-start">
        <div className="max-w-2xl">
          <BrandMark size="md" />
          <h2 className="mt-5 font-display text-2xl text-white">Building at the intersection of atoms and bits?</h2>
          <p className="mt-3 max-w-xl text-muted">
            Whether you are scaling in autonomy, deploying industrial intelligence, or expanding from the CEE diaspora to global markets, we want to hear from you.
          </p>
          <ButtonLink href="/contact" variant="accent" className="mt-5">Get in Touch</ButtonLink>
        </div>
        <div className="lg:justify-self-end lg:text-right">
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            {supportLogos.map(({ src, alt }) => (
              <img key={src} src={src} alt={alt} className="h-10 w-auto object-contain" loading="lazy" decoding="async" />
            ))}
          </div>
          <p className="mt-3 max-w-2xl text-xs text-muted lg:ml-auto">
            The support and commitment from EIF are made through InnovFin Equity, with the financial backing of the European Union (EU) under Horizon 2020 Financial Instruments, as well as financial backing of the EU under the European Fund for Strategic Investments and the Pan-European Guarantee Fund.
          </p>
          <p className="mt-4 text-xs text-muted">© {new Date().getFullYear()} FerSil Ventures. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
