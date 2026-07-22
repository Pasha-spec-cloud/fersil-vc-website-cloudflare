import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/constants';
import { verifyTotp } from '@/lib/totp';

type AdminCredentials = {
  email: string;
  password: string;
};

const DEFAULT_ADMIN_EMAIL = 'admin@fersil.vc';
const DEFAULT_ADMIN_PASSWORD = 'changeme';

function adminOpenAccess(): boolean {
  return process.env.ADMIN_OPEN_ACCESS === '1';
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? 'fersil-admin-session';
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function safeCompare(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}

function twoFactorRequired(): boolean {
  const flag = process.env.NEXT_PUBLIC_ADMIN_2FA_ENABLED === '1';
  const secret = (process.env.ADMIN_TOTP_SECRET ?? '').trim();
  return flag && secret.length > 0;
}

export function getAdminCredentials(): AdminCredentials {
  return {
    email: normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL),
    password: process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD
  };
}

export function hasActiveAdminSession(): boolean {
  if (adminOpenAccess()) {
    return true;
  }
  const cookieValue = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!cookieValue) {
    return false;
  }
  return safeCompare(cookieValue, getSessionSecret());
}

export function assertAdminSession(): void {
  if (!hasActiveAdminSession()) {
    throw new Error('Unauthorized');
  }
}

export async function createAdminSession(
  email: string,
  password: string,
  otp?: string
): Promise<{ success: boolean; error?: string }> {
  if (adminOpenAccess()) {
    return { success: true };
  }

  const credentials = getAdminCredentials();
  const normalizedEmail = normalizeEmail(email);
  if (!safeCompare(normalizedEmail, credentials.email)) {
    return { success: false, error: 'Incorrect email, password, or one-time code' };
  }

  let passwordOk = false;
  try {
    const { getAdminSettings, verifyPasswordHash } = await import('@/lib/admin-settings');
    const settings = await getAdminSettings();
    if (settings.passwordHash) {
      passwordOk = verifyPasswordHash(password, settings.passwordHash);
    }
  } catch {}
  if (!passwordOk) {
    passwordOk = safeCompare(password, credentials.password);
  }
  if (!passwordOk) {
    return { success: false, error: 'Incorrect email, password, or one-time code' };
  }

  if (twoFactorRequired()) {
    const secret = String(process.env.ADMIN_TOTP_SECRET);
    if (!otp || !verifyTotp(secret, String(otp))) {
      return { success: false, error: 'Incorrect email, password, or one-time code' };
    }
  }

  const cookieStore = cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getSessionSecret(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/'
  });

  return { success: true };
}

export function destroyAdminSession(): void {
  if (adminOpenAccess()) {
    return;
  }
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
