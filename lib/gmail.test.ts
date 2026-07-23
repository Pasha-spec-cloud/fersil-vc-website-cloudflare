import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendDeveloperAccessCode } from '@/lib/gmail';

describe('Gmail access-code delivery', () => {
  beforeEach(() => {
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_ID', 'client-id');
    vi.stubEnv('GOOGLE_OAUTH_CLIENT_SECRET', 'client-secret');
    vi.stubEnv('GOOGLE_OAUTH_REFRESH_TOKEN', 'refresh-token');
    vi.stubEnv('GMAIL_SENDER_EMAIL', 'admin@fersil.vc');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('exchanges the refresh token and sends a base64url Gmail message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'access-token' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 'message-id' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendDeveloperAccessCode('ani@fersil.vc', '123456');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://oauth2.googleapis.com/token');
    expect(String(fetchMock.mock.calls[0][1]?.body)).toContain('grant_type=refresh_token');
    expect(fetchMock.mock.calls[1][0]).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages/send');

    const gmailRequest = fetchMock.mock.calls[1][1];
    expect(gmailRequest?.headers).toMatchObject({ Authorization: 'Bearer access-token' });
    const raw = JSON.parse(String(gmailRequest?.body)).raw as string;
    const decoded = Buffer.from(raw, 'base64url').toString('utf8');
    expect(decoded).toContain('To: ani@fersil.vc');
    expect(decoded).toContain('123456');
  });
});
