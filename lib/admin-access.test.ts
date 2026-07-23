import { afterEach, describe, expect, it, vi } from 'vitest';

import { isAdminOpenAccessEnabled } from '@/lib/admin-access';

describe('admin open access', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('can be enabled for local development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ADMIN_OPEN_ACCESS', '1');
    expect(isAdminOpenAccessEnabled()).toBe(true);
  });

  it('cannot be enabled in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_OPEN_ACCESS', '1');
    expect(isAdminOpenAccessEnabled()).toBe(false);
  });
});
