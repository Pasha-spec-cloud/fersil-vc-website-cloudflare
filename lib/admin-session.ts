import { ADMIN_SESSION_MAX_AGE } from '@/lib/constants';

type AdminSessionPayload = {
  email: string;
  exp: number;
};

function getSessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV !== 'production') return 'fersil-admin-session-local-only';
  return null;
}

function bytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function arrayBuffer(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

function encode(value: Uint8Array): string {
  return Buffer.from(value).toString('base64url');
}

function decode(value: string): Uint8Array {
  return Uint8Array.from(Buffer.from(value, 'base64url'));
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey('raw', arrayBuffer(bytes(secret)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const payload = encode(bytes(JSON.stringify({
    email: email.trim().toLowerCase(),
    exp: Date.now() + ADMIN_SESSION_MAX_AGE * 1000
  } satisfies AdminSessionPayload)));
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), arrayBuffer(bytes(payload)));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}

export async function readAdminSessionToken(token: string | undefined): Promise<AdminSessionPayload | null> {
  const secret = getSessionSecret();
  if (!secret || !token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  try {
    const signatureBytes = decode(signature);
    const valid = await crypto.subtle.verify(
      'HMAC',
      await signingKey(secret),
      arrayBuffer(signatureBytes),
      arrayBuffer(bytes(payload))
    );
    if (!valid) return null;
    const parsed = JSON.parse(Buffer.from(decode(payload)).toString('utf8')) as AdminSessionPayload;
    return parsed.email && parsed.exp > Date.now() ? parsed : null;
  } catch {
    return null;
  }
}
