import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { readContentFile, writeContentFile } from '@/lib/storage';

type AdminSettings = {
  email?: string;
  passwordHash?: string;
};

async function readSettings(): Promise<AdminSettings> {
  try {
    const raw = await readContentFile('admin.json');
    return JSON.parse(raw) as AdminSettings;
  } catch {
    return {};
  }
}

async function writeSettings(settings: AdminSettings): Promise<void> {
  await writeContentFile('admin.json', `${JSON.stringify(settings, null, 2)}\n`);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 32).toString('hex');
  return `scrypt:${salt}:${key}`;
}

export function verifyPasswordHash(password: string, hash: string): boolean {
  const [scheme, salt, keyHex] = hash.split(':');
  if (scheme !== 'scrypt' || !salt || !keyHex) return false;
  const derived = scryptSync(password, salt, 32);
  const stored = Buffer.from(keyHex, 'hex');
  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}

export async function getAdminSettings(): Promise<AdminSettings> {
  return readSettings();
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  const current = await readSettings();
  const passwordHash = hashPassword(newPassword);
  await writeSettings({ ...current, passwordHash });
}
