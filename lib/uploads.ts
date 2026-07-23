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
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function detectImageType(buffer: Buffer): { extension: string; contentType: string } | null {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { extension: '.png', contentType: 'image/png' };
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: '.jpg', contentType: 'image/jpeg' };
  }
  if (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' || buffer.subarray(0, 6).toString('ascii') === 'GIF89a') {
    return { extension: '.gif', contentType: 'image/gif' };
  }
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return { extension: '.webp', contentType: 'image/webp' };
  }
  return null;
}

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

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('Image uploads must be 5 MB or smaller');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const image = detectImageType(buffer);
  if (!image) {
    throw new Error('Upload a PNG, JPEG, GIF, or WebP image');
  }
  const key = buildUploadKey(image.extension, options);
  return uploadMediaObject(key, buffer, image.contentType);
}

export function getUploadsRoot(): string {
  return uploadsRoot;
}
