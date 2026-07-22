import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Learn about open roles at FerSil VC and within the portfolio.'
};

export default function CareersPage() {
  return (
    <div className="py-16">
      <Container className="space-y-8 text-center">
        <SectionHeading
          kicker="Careers"
          title="We are assembling the next chapter"
          description="We are building a pipeline of future roles at FerSil VC and across the portfolio. Share your details and we will be in touch as positions open."
        />
        <p className="mx-auto max-w-2xl text-muted">
          We are not actively hiring for full-time roles right now, but we welcome warm introductions to operators, investors, and builders who care about robotics, industrial systems, and physical-world intelligence. Reach out at{' '}
          <a href="mailto:careers@fersil.vc" className="text-primary">
            careers@fersil.vc
          </a>{' '}
          or follow us on LinkedIn for future updates.
        </p>
      </Container>
    </div>
  );
}
