import { BrandMark } from '@/components/brand/brand-mark';
import { Container } from '@/components/ui/container';

const supportLogos = [
  'https://almazcapital.com/assets/img-support-1.png',
  'https://almazcapital.com/assets/img-support-2.png',
  'https://almazcapital.com/assets/img-support-3.png'
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10 text-sm text-muted">
      <Container className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:items-start">
        <div className="max-w-2xl">
          <BrandMark size="md" />
          <p className="mt-4 max-w-xl text-muted">
            Backing founders building at the ferrum-silicon interface, with a particular lens on CEE diaspora founders, robotics, industrial systems, and software that learns from the physical world.
          </p>
        </div>
        <div className="lg:justify-self-end lg:text-right">
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            {supportLogos.map((src, index) => (
              <img key={src} src={src} alt={`Support visual ${index + 1}`} className="h-10 w-auto object-contain" loading="lazy" decoding="async" />
            ))}
          </div>
          <p className="mt-3 max-w-2xl text-xs text-muted lg:ml-auto">
            The support and commitment from EIF are made through InnovFin Equity, with the financial backing of the European Union (EU) under Horizon 2020 Financial Instruments, as well as financial backing of the EU under the European Fund for Strategic Investments and the Pan-European Guarantee Fund.
          </p>
          <p className="mt-4 text-xs text-muted">© {new Date().getFullYear()} FerSil VC. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
