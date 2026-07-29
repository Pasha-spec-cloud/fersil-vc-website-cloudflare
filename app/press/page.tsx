import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Press',
  description: 'Press contacts and media resources for FerSil Ventures.'
};

export default function PressPage() {
  return (
    <div className="py-16">
      <Container className="space-y-8 text-center">
        <SectionHeading
          kicker="Press"
          title="Media resources"
          description="Get in touch for interviews, background, and portfolio context related to FerSil Ventures."
        />
        <p className="mx-auto max-w-2xl text-muted">
          For media inquiries please email{' '}
          <a href="mailto:press@fersil.vc" className="text-primary">
            press@fersil.vc
          </a>{' '}
          with your request, deadline, and publication details. We will reply promptly.
        </p>
      </Container>
    </div>
  );
}
