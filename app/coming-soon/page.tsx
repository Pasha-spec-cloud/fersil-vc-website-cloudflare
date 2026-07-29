import type { Metadata } from 'next';

import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { DeveloperAccessForm } from './developer-access-form';

export const metadata: Metadata = {
  title: 'Coming Soon'
};

export default function ComingSoonPage() {
  return (
    <div className="py-24">
      <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-muted">FerSil Ventures</p>
        <h1 className="mt-4 h2">Coming Soon</h1>
        <p className="mt-3 max-w-xl text-muted">
          We are preparing a private launch. The public site is blocked for now.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="mailto:team@fersil.vc">Contact</ButtonLink>
        </div>
        <DeveloperAccessForm />
      </Container>
    </div>
  );
}
