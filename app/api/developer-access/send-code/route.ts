import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { DEVELOPER_ACCESS_COOKIE } from '@/lib/constants';
import {
  getDeveloperAccessTtlSeconds,
  isAllowedDeveloperEmail,
  isValidDeveloperPassword,
  issueDeveloperAccessToken,
  normalizeDeveloperEmail,
} from '@/lib/developer-access';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = normalizeDeveloperEmail(body.email ?? '');
    const password = String(body.password ?? '');

    if (!email || !isAllowedDeveloperEmail(email)) {
      return NextResponse.json({ ok: false, error: 'Access is limited to approved FerSil addresses.' }, { status: 400 });
    }

    if (!isValidDeveloperPassword(password)) {
      return NextResponse.json({ ok: false, error: 'Invalid password.' }, { status: 400 });
    }

    const { token } = await issueDeveloperAccessToken(email);

    const cookieStore = cookies();
    cookieStore.set(DEVELOPER_ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: getDeveloperAccessTtlSeconds(),
      path: '/'
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
