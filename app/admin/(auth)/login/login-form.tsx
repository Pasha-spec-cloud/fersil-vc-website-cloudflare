'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { AdminInput, labelStyles } from '@/components/admin/form-controls';

import { loginAction } from './actions';

const initialState = { error: undefined as string | undefined };

type LoginFormProps = {
  redirectTo: string;
  twoFactorRequired?: boolean;
};

export function LoginForm({ redirectTo, twoFactorRequired }: LoginFormProps) {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className="space-y-2">
        <label htmlFor="email" className={labelStyles}>
          Email
        </label>
        <AdminInput id="email" name="email" type="email" required autoComplete="email" placeholder="you@fersil.vc" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className={labelStyles}>
          Password
        </label>
        <AdminInput id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>
      {twoFactorRequired && (
        <div className="space-y-2">
          <label htmlFor="otp" className={labelStyles}>
            One-time code (Google Authenticator)
          </label>
          <AdminInput id="otp" name="otp" inputMode="numeric" pattern="\d{6}" placeholder="123456" />
        </div>
      )}
      {state.error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}
