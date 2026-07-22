import { createHmac } from 'node:crypto';

function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');
  let bits = '';
  for (const c of clean) {
    const val = alphabet.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [] as number[];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = tmp & 0xff;
    tmp = Math.floor(tmp / 256);
  }
  const hmac = createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

export function generateTotp(base32Secret: string, period = 30, timestamp = Date.now()): string {
  const counter = Math.floor(Math.floor(timestamp / 1000) / period);
  return hotp(base32Decode(base32Secret), counter);
}

export function verifyTotp(base32Secret: string, token: string, window = 1, period = 30): boolean {
  const counter = Math.floor(Math.floor(Date.now() / 1000) / period);
  const key = base32Decode(base32Secret);
  const code = token.replace(/\s+/g, '');
  for (let w = -window; w <= window; w++) {
    if (hotp(key, counter + w) === code) return true;
  }
  return false;
}
