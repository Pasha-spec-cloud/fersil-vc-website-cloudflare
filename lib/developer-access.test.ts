import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  generateDeveloperAccessCode,
  isAllowedDeveloperEmail,
  issueDeveloperAccessToken,
  issueDeveloperChallenge,
  readDeveloperToken,
  reduceDeveloperChallengeAttempts,
  verifyDeveloperChallenge
} from '@/lib/developer-access';

describe('developer access', () => {
  beforeEach(() => {
    vi.stubEnv('DEVELOPER_ACCESS_SECRET', 'test-secret-that-is-long-enough-for-hmac');
  });

  it('only accepts the fersil.vc domain', () => {
    expect(isAllowedDeveloperEmail('Pasha@FerSil.vc')).toBe(true);
    expect(isAllowedDeveloperEmail('person@sub.fersil.vc')).toBe(false);
    expect(isAllowedDeveloperEmail('person@fersil.vc.example')).toBe(false);
    expect(isAllowedDeveloperEmail('person@gmail.com')).toBe(false);
  });

  it('generates a six-digit code', () => {
    expect(generateDeveloperAccessCode()).toMatch(/^\d{6}$/);
  });

  it('verifies the right code and rejects the wrong code', async () => {
    const token = await issueDeveloperChallenge('ani@fersil.vc', '123456');
    await expect(verifyDeveloperChallenge(token, 'ani@fersil.vc', '123456')).resolves.toMatchObject({ valid: true });
    await expect(verifyDeveloperChallenge(token, 'ani@fersil.vc', '654321')).resolves.toMatchObject({ valid: false });
  });

  it('reduces attempts without changing the valid code', async () => {
    const token = await issueDeveloperChallenge('michael@fersil.vc', '101010');
    const first = await verifyDeveloperChallenge(token, 'michael@fersil.vc', '000000');
    expect(first.payload).not.toBeNull();
    const reduced = await reduceDeveloperChallengeAttempts(first.payload!);
    const result = await verifyDeveloperChallenge(reduced, 'michael@fersil.vc', '101010');
    expect(result.valid).toBe(true);
    expect(result.payload?.attempts).toBe(4);
  });

  it('issues a signed browser access token', async () => {
    const { token } = await issueDeveloperAccessToken('pasha@fersil.vc');
    await expect(readDeveloperToken(token, 'access')).resolves.toMatchObject({
      email: 'pasha@fersil.vc',
      purpose: 'access'
    });
  });
});
