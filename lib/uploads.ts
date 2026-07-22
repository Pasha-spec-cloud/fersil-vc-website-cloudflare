import crypto from 'node:crypto';
import path from 'node:path';

import { uploadMediaObject } from '@/lib/storage';

type SaveUploadedFileOptions = {
  /**
   * Optional directory prefix inside /public/media/uploads.
   * Example: `logos` → /public/media/uploads/logos/YYYY/MM/file.png
   */
  prefix?: string;
};

type UploadPathOptions = SaveUploadedFileOptions & {
  now?: Date;
  /**
   * Testing hook that allows deterministic file names.
   */
  randomSuffix?: string;
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg'
};

const uploadsRoot = path.join(process.cwd(), 'public', 'media', 'uploads');

function sanitizePrefix(prefix?: string): string | undefined {
  if (!prefix) {
    return undefined;
  }
  const safeSegments = prefix
    .split(/[/\\]/)
    .map((segment) => segment.trim())
    .filter((segment) => segment && segment !== '.' && segment !== '..');
  if (safeSegments.length === 0) {
    return undefined;
  }
  return safeSegments.join('/');
}

function ensureLeadingDot(extension: string): string {
  if (!extension) {
    return '';
  }
  return extension.startsWith('.') ? extension : `.${extension}`;
}

export function getUploadFileExtension(file: File): string {
  const fromName = file.name ? path.extname(file.name).toLowerCase() : '';
  if (fromName) {
    return fromName;
  }
  const mime = file.type?.toLowerCase();
  if (mime && MIME_EXTENSION_MAP[mime]) {
    return MIME_EXTENSION_MAP[mime];
  }
  return '.bin';
}

export function buildUploadPath(extension: string, options: UploadPathOptions = {}): {
  absolutePath: string;
  relativePath: string;
  directory: string;
} {
  const key = buildUploadKey(extension, options);
  const absolutePath = path.join(uploadsRoot, key.replace(/^uploads\//, ''));

  return {
    absolutePath,
    relativePath: `/media/${key}`,
    directory: path.dirname(absolutePath)
  };
}

function buildUploadKey(extension: string, options: UploadPathOptions = {}): string {
  const now = options.now ?? new Date();
  const safePrefix = sanitizePrefix(options.prefix);
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const safeExtension = ensureLeadingDot(extension || '.bin');
  const randomSuffix = options.randomSuffix ?? crypto.randomBytes(6).toString('hex');
  const filename = `${now.getTime()}-${randomSuffix}${safeExtension}`;
  const segments = ['uploads', ...(safePrefix ? [safePrefix] : []), year, month, filename];

  return segments.join('/');
}

export async function saveUploadedFile(file: File | null, options: SaveUploadedFileOptions = {}): Promise<string | undefined> {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    return undefined;
  }

  const extension = getUploadFileExtension(file);
  const key = buildUploadKey(extension, options);
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadMediaObject(key, buffer, file.type || undefined);
}

export function getUploadsRoot(): string {
  return uploadsRoot;
}
