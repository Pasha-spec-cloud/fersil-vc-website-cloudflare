import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { DEVELOPER_ACCESS_COOKIE, DEVELOPER_ACCESS_PENDING_COOKIE } from '@/lib/constants';
import {
  getDeveloperAccessTtlSeconds,
  getRemainingChallengeAttempts,
  isAllowedDeveloperEmail,
  issueDeveloperAccessToken,
  normalizeDeveloperEmail,
  reduceDeveloperChallengeAttempts,
  verifyDeveloperChallenge
} from '@/lib/developer-access';
import { getCloudflareRateLimiter } from '@/lib/cloudflare';

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; code?: string };
  const email = normalizeDeveloperEmail(body.email ?? '');
  const code = String(body.code ?? '').trim();
  if (!isAllowedDeveloperEmail(email) || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: 'Enter the six-digit code sent to your FerSil email.' }, { status: 400 });
  }

  const limiter = await getCloudflareRateLimiter('ACCESS_CODE_VERIFY_RATE_LIMITER');
  if (limiter) {
    const ip = request.headers.get('CF-Connecting-IP')
      ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? 'unknown';
    const [emailLimit, ipLimit] = await Promise.all([
      limiter.limit({ key: `email:${email}` }),
      limiter.limit({ key: `ip:${ip}` })
    ]);
    if (!emailLimit.success || !ipLimit.success) {
      return NextResponse.json({ ok: false, error: 'Too many verification attempts. Try again in a minute.' }, { status: 429 });
    }
  }

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(DEVELOPER_ACCESS_PENDING_COOKIE)?.value;
  const result = await verifyDeveloperChallenge(pendingToken, email, code);
  if (!result.valid || !result.payload) {
    if (result.payload) {
      const attempts = getRemainingChallengeAttempts(result.payload);
      if (attempts > 0) {
        cookieStore.set(DEVELOPER_ACCESS_PENDING_COOKIE, await reduceDeveloperChallengeAttempts(result.payload), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 10 * 60,
          path: '/'
        });
      } else {
        cookieStore.delete(DEVELOPER_ACCESS_PENDING_COOKIE);
      }
    }
    return NextResponse.json({ ok: false, error: 'That code is invalid or expired. Request a new code and try again.' }, { status: 400 });
  }

  const { token } = await issueDeveloperAccessToken(email);
  cookieStore.set(DEVELOPER_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: getDeveloperAccessTtlSeconds(),
    path: '/'
  });
  cookieStore.delete(DEVELOPER_ACCESS_PENDING_COOKIE);

  return NextResponse.json({ ok: true });
}
