import type { Metadata } from 'next';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminInput, labelStyles } from '@/components/admin/form-controls';

export const metadata: Metadata = {
  title: 'Security'
};

export default function SecurityPage() {
  const twoFactor = process.env.NEXT_PUBLIC_ADMIN_2FA_ENABLED === '1';
  return (
    <div className="space-y-6">
      <Card title="Change Admin Password" eyebrow="Security">
        <form method="POST" action="/api/admin/password" className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className={labelStyles}>Current Password</label>
            <AdminInput id="currentPassword" name="currentPassword" type="password" required placeholder="••••••••" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="newPassword" className={labelStyles}>New Password</label>
              <AdminInput id="newPassword" name="newPassword" type="password" required minLength={8} placeholder="At least 8 characters" />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className={labelStyles}>Confirm New Password</label>
              <AdminInput id="confirmPassword" name="confirmPassword" type="password" required minLength={8} placeholder="Re-enter new password" />
            </div>
          </div>
          {twoFactor && (
            <div className="space-y-2">
              <label htmlFor="otp" className={labelStyles}>One-time code</label>
              <AdminInput id="otp" name="otp" inputMode="numeric" pattern="\d{6}" placeholder="123456" />
            </div>
          )}
          <Button type="submit">Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
