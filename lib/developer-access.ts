const ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;

type TokenPurpose = 'access' | 'challenge';

type SignedPayload = {
  email: string;
  exp: number;
  purpose: TokenPurpose;
  codeDigest?: string;
  attempts?: number;
  issuedAt?: number;
};

function getSecret(): string {
  const secret = process.env.DEVELOPER_ACCESS_SECRET ?? process.env.ADMIN_SESSION_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DEVELOPER_ACCESS_SECRET is not configured');
  }
  return 'fersil-developer-access-local-only';
}

function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function utf8Buffer(value: string): ArrayBuffer {
  const bytes = utf8(value);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return Uint8Array.from(Buffer.from(padded, 'base64'));
}

function base64UrlBuffer(value: string): ArrayBuffer {
  const bytes = fromBase64Url(value);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function importSigningKey() {
  return crypto.subtle.importKey('raw', utf8Buffer(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signValue(value: string): Promise<string> {
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign('HMAC', key, utf8Buffer(value));
  return toBase64Url(new Uint8Array(signature));
}

async function verifyValue(value: string, signature: string): Promise<boolean> {
  const key = await importSigningKey();
  return crypto.subtle.verify('HMAC', key, base64UrlBuffer(signature), utf8Buffer(value));
}

export function normalizeDeveloperEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedDeveloperEmail(email: string): boolean {
  const normalized = normalizeDeveloperEmail(email);
  const [localPart, domain, extra] = normalized.split('@');
  return Boolean(localPart && domain === 'fersil.vc' && !extra);
}

export async function createDeveloperToken(payload: SignedPayload): Promise<string> {
  const encodedPayload = toBase64Url(utf8(JSON.stringify(payload)));
  const signature = await signValue(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function readDeveloperToken(token: string | undefined, purpose: TokenPurpose): Promise<SignedPayload | null> {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const valid = await verifyValue(encodedPayload, signature);
  if (!valid) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(fromBase64Url(encodedPayload)).toString('utf8')) as SignedPayload;
    if (payload.purpose !== purpose || payload.exp <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function issueDeveloperAccessToken(email: string): Promise<{ token: string; exp: number }> {
  const payload: SignedPayload = {
    email: normalizeDeveloperEmail(email),
    exp: Date.now() + ACCESS_TTL_MS,
    purpose: 'access'
  };

  return { token: await createDeveloperToken(payload), exp: payload.exp };
}

export function generateDeveloperAccessCode(): string {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return value.toString().padStart(6, '0');
}

export async function issueDeveloperChallenge(email: string, code: string, attempts = MAX_CODE_ATTEMPTS): Promise<string> {
  const normalizedEmail = normalizeDeveloperEmail(email);
  const issuedAt = Date.now();
  return createDeveloperToken({
    email: normalizedEmail,
    exp: issuedAt + CHALLENGE_TTL_MS,
    purpose: 'challenge',
    codeDigest: await signValue(`${normalizedEmail}:${code}`),
    attempts,
    issuedAt
  });
}

export async function verifyDeveloperChallenge(
  token: string | undefined,
  email: string,
  code: string
): Promise<{ valid: boolean; payload: SignedPayload | null }> {
  const payload = await readDeveloperToken(token, 'challenge');
  const normalizedEmail = normalizeDeveloperEmail(email);
  if (!payload || payload.email !== normalizedEmail || !payload.codeDigest || (payload.attempts ?? 0) <= 0) {
    return { valid: false, payload };
  }

  return {
    valid: await verifyValue(`${normalizedEmail}:${code}`, payload.codeDigest),
    payload
  };
}

export function canResendDeveloperCode(token: string | undefined): Promise<boolean> {
  return readDeveloperToken(token, 'challenge').then(
    (payload) => !payload?.issuedAt || Date.now() - payload.issuedAt >= RESEND_COOLDOWN_MS
  );
}

export function getDeveloperChallengeTtlSeconds(): number {
  return Math.floor(CHALLENGE_TTL_MS / 1000);
}

export function getRemainingChallengeAttempts(payload: SignedPayload): number {
  return Math.max(0, (payload.attempts ?? MAX_CODE_ATTEMPTS) - 1);
}

export function reduceDeveloperChallengeAttempts(payload: SignedPayload): Promise<string> {
  return createDeveloperToken({
    ...payload,
    attempts: getRemainingChallengeAttempts(payload)
  });
}

export function getDeveloperAccessTtlSeconds(): number {
  return Math.floor(ACCESS_TTL_MS / 1000);
}
