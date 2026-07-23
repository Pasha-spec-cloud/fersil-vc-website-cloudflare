type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

function requiredEnv(name: 'GOOGLE_OAUTH_CLIENT_ID' | 'GOOGLE_OAUTH_CLIENT_SECRET' | 'GOOGLE_OAUTH_REFRESH_TOKEN'): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

async function getGoogleAccessToken(): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requiredEnv('GOOGLE_OAUTH_CLIENT_ID'),
      client_secret: requiredEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
      refresh_token: requiredEnv('GOOGLE_OAUTH_REFRESH_TOKEN'),
      grant_type: 'refresh_token'
    })
  });
  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? payload.error ?? 'Google OAuth token exchange failed');
  }
  return payload.access_token;
}

export async function sendDeveloperAccessCode(email: string, code: string): Promise<void> {
  const sender = (process.env.GMAIL_SENDER_EMAIL ?? 'admin@fersil.vc').trim();
  const safeRecipient = email.replace(/[\r\n]/g, '');
  const safeSender = sender.replace(/[\r\n]/g, '');
  const message = [
    `From: FerSil VC <${safeSender}>`,
    `To: ${safeRecipient}`,
    'Subject: Your FerSil VC access code',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    `Your FerSil VC website access code is: ${code}`,
    '',
    'It expires in 10 minutes. If you did not request this code, you can ignore this email.'
  ].join('\r\n');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getGoogleAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodeBase64Url(message) })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gmail send failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}
