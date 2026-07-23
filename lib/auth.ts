import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '@/lib/constants';
import { isAdminOpenAccessEnabled } from '@/lib/admin-access';
import { createAdminSessionToken, readAdminSessionToken } from '@/lib/admin-session';
import { getCloudflareRateLimiter } from '@/lib/cloudflare';
import { verifyTotp } from '@/lib/totp';

type AdminCredentials = {
  email: string;
  password: string;
};

const DEFAULT_ADMIN_EMAIL = 'admin@fersil.vc';

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
  const flag = process.env.ADMIN_2FA_ENABLED === '1';
  const secret = (process.env.ADMIN_TOTP_SECRET ?? '').trim();
  return flag && secret.length > 0;
}

export function getAdminCredentials(): AdminCredentials {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password && process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD is not configured');
  }
  return {
    email: normalizeEmail(process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL),
    password: password ?? 'changeme-local-only'
  };
}

export async function hasActiveAdminSession(): Promise<boolean> {
  if (isAdminOpenAccessEnabled()) {
    return true;
  }
  const cookieValue = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(await readAdminSessionToken(cookieValue));
}

export async function assertAdminSession(): Promise<void> {
  if (!(await hasActiveAdminSession())) {
    throw new Error('Unauthorized');
  }
}

export async function createAdminSession(
  email: string,
  password: string,
  otp?: string
): Promise<{ success: boolean; error?: string }> {
  if (isAdminOpenAccessEnabled()) {
    return { success: true };
  }

  const credentials = getAdminCredentials();
  const normalizedEmail = normalizeEmail(email);
  const limiter = await getCloudflareRateLimiter('ADMIN_LOGIN_RATE_LIMITER');
  if (limiter && !(await limiter.limit({ key: normalizedEmail || 'missing-email' })).success) {
    return { success: false, error: 'Too many sign-in attempts. Try again in a minute.' };
  }
  if (!safeCompare(normalizedEmail, credentials.email)) {
    return { success: false, error: 'Incorrect email, password, or one-time code' };
  }

  let passwordOk = false;
  let hasStoredHash = false;
  try {
    const { getAdminSettings, verifyPasswordHash } = await import('@/lib/admin-settings');
    const settings = await getAdminSettings();
    if (settings.passwordHash) {
      hasStoredHash = true;
      passwordOk = verifyPasswordHash(password, settings.passwordHash);
    }
  } catch {}
  if (!hasStoredHash) {
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

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(normalizedEmail), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/'
  });

  return { success: true };
}

export async function destroyAdminSession(): Promise<void> {
  if (isAdminOpenAccessEnabled()) {
    return;
  }
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
