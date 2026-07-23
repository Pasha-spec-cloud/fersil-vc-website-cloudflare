import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession, getAdminCredentials } from '@/lib/auth';
import { getAdminSettings, setAdminPassword, verifyPasswordHash } from '@/lib/admin-settings';
import { verifyTotp } from '@/lib/totp';

export async function POST(request: NextRequest) {
  await assertAdminSession();
  try {
    const form = await request.formData();
    const currentPassword = String(form.get('currentPassword') ?? '');
    const newPassword = String(form.get('newPassword') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');
    const otp = String(form.get('otp') ?? '');

    if (!newPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
      return NextResponse.json({ ok: false, error: 'Password requirements not met' }, { status: 400 });
    }

    const creds = getAdminCredentials();
    let currentOk = false;
    const settings = await getAdminSettings();
    if (settings.passwordHash) {
      currentOk = verifyPasswordHash(currentPassword, settings.passwordHash);
    }
    if (!settings.passwordHash && !currentOk && currentPassword === creds.password) {
      currentOk = true;
    }
    if (!currentOk) {
      return NextResponse.json({ ok: false, error: 'Incorrect current password' }, { status: 400 });
    }

    if (process.env.ADMIN_2FA_ENABLED === '1') {
      const secret = (process.env.ADMIN_TOTP_SECRET ?? '').trim();
      if (!secret || !otp || !verifyTotp(secret, otp)) {
        return NextResponse.json({ ok: false, error: 'Invalid one-time code' }, { status: 400 });
      }
    }

    await setAdminPassword(newPassword);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
