'use server';

import { redirect } from 'next/navigation';
import type { Route } from 'next';

import { createAdminSession } from '@/lib/auth';

type LoginState = {
  error?: string;
};

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const otp = String(formData.get('otp') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/admin');

  const result = await createAdminSession(email, password, otp);
  if (!result.success) {
    return { error: result.error ?? 'Invalid credentials' };
  }

  const safeRedirect = redirectTo.startsWith('/admin') ? redirectTo : '/admin';
  redirect(safeRedirect as Route);
}
