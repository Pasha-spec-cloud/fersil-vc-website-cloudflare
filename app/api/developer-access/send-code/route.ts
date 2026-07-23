import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { DEVELOPER_ACCESS_COOKIE, DEVELOPER_ACCESS_PENDING_COOKIE } from '@/lib/constants';
import {
  canResendDeveloperCode,
  generateDeveloperAccessCode,
  getDeveloperChallengeTtlSeconds,
  isAllowedDeveloperEmail,
  issueDeveloperChallenge,
  normalizeDeveloperEmail,
} from '@/lib/developer-access';
import { sendDeveloperAccessCode } from '@/lib/gmail';
import { getCloudflareRateLimiter } from '@/lib/cloudflare';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeDeveloperEmail(body.email ?? '');

    if (!email || !isAllowedDeveloperEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Use a valid @fersil.vc email address.' }, { status: 400 });
    }

    const limiter = await getCloudflareRateLimiter('ACCESS_CODE_RATE_LIMITER');
    if (limiter && !(await limiter.limit({ key: email })).success) {
      return NextResponse.json({ ok: false, error: 'Too many code requests. Please try again in a minute.' }, { status: 429 });
    }

    const cookieStore = await cookies();
    const pendingToken = cookieStore.get(DEVELOPER_ACCESS_PENDING_COOKIE)?.value;
    if (!(await canResendDeveloperCode(pendingToken))) {
      return NextResponse.json({ ok: false, error: 'Please wait one minute before requesting another code.' }, { status: 429 });
    }

    const code = generateDeveloperAccessCode();
    await sendDeveloperAccessCode(email, code);
    const token = await issueDeveloperChallenge(email, code);

    cookieStore.delete(DEVELOPER_ACCESS_COOKIE);
    cookieStore.set(DEVELOPER_ACCESS_PENDING_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getDeveloperChallengeTtlSeconds(),
      path: '/'
    });

    return NextResponse.json({ ok: true, email });
  } catch (error) {
    console.error('Developer access email failed', error);
    return NextResponse.json({ ok: false, error: 'Unable to send the access code. Please try again shortly.' }, { status: 500 });
  }
}
