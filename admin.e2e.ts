import { test, expect } from '@playwright/test';

import { generateTotp } from './lib/totp';

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? 'admin@amz-capital.com';
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? 'changeme';
const totpSecret = process.env.PLAYWRIGHT_ADMIN_TOTP_SECRET ?? process.env.ADMIN_TOTP_SECRET;

function resolveOtp(): string {
  if (process.env.PLAYWRIGHT_ADMIN_OTP) {
    return process.env.PLAYWRIGHT_ADMIN_OTP;
  }
  if (totpSecret) {
    return generateTotp(totpSecret);
  }
  return '000000';
}

test.describe('admin auth flows', () => {
  test('redirects unauthenticated visitors to the login page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByText('Admin Console')).toBeVisible();
  });

  test('logs in with valid credentials and views the dashboard', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email').fill(adminEmail);
    await page.getByLabel('Password').fill(adminPassword);
    const otpField = page.getByLabel(/One-time code/i);
    if (await otpField.count()) {
      await otpField.fill(resolveOtp());
    }
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/admin');
    await expect(page.getByText('Content Console')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Companies' })).toBeVisible();
  });
});
