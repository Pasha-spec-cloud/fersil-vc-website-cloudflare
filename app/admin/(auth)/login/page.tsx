import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { Card } from '@/components/ui/card';

import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Admin Login'
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (process.env.ADMIN_OPEN_ACCESS === '1') {
    redirect('/admin');
  }

  const query = await searchParams;
  const redirectTo = typeof query?.from === 'string' && query.from ? query.from : '/admin';
  const resetOk = query?.reset === '1';

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center py-16">
      <Card title="Admin Console" eyebrow="Restricted">
        {resetOk && (
          <p className="mb-4 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">Password updated. Please sign in.</p>
        )}
        <p className="mb-6 text-sm text-muted">
          Enter the credentials shared with your operations team to update companies, team members, and news in real time.
        </p>
        <LoginForm redirectTo={redirectTo} twoFactorRequired={process.env.NEXT_PUBLIC_ADMIN_2FA_ENABLED === '1'} />

      </Card>
    </div>
  );
}
