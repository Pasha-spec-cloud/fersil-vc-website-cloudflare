import fs from 'node:fs/promises';
import path from 'node:path';

import { getCloudflareBindings, type R2ObjectLike } from '@/lib/cloudflare';

const contentRoot = path.join(process.cwd(), 'content');
const mediaRoot = path.join(process.cwd(), 'public', 'media');

export async function isCloudflareStorageEnabled(): Promise<boolean> {
  const { contentBucket } = await getCloudflareBindings();
  return Boolean(contentBucket);
}

export async function readContentFile(filename: string): Promise<string> {
  const filePath = path.join(contentRoot, filename);
  const { contentBucket } = await getCloudflareBindings();
  if (!contentBucket) {
    return fs.readFile(filePath, 'utf8');
  }

  const object = await contentBucket.get(filename);
  if (object) {
    const buffer = Buffer.from(await object.arrayBuffer());
    return buffer.toString('utf8');
  }

  return fs.readFile(filePath, 'utf8');
}

export async function writeContentFile(filename: string, contents: string): Promise<void> {
  const { contentBucket } = await getCloudflareBindings();
  if (!contentBucket) {
    const filePath = path.join(contentRoot, filename);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, contents, 'utf8');
    return;
  }

  await contentBucket.put(filename, contents, {
    httpMetadata: { contentType: 'application/json' }
  });
}

export async function uploadMediaObject(key: string, buffer: Buffer, contentType?: string): Promise<string> {
  const normalizedKey = key.replace(/^\/+/, '');
  const { mediaBucket } = await getCloudflareBindings();

  if (!mediaBucket) {
    const filePath = path.join(mediaRoot, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return `/media/${key.replace(/^\/+/, '')}`;
  }

  await mediaBucket.put(normalizedKey, buffer, {
    httpMetadata: { contentType }
  });

  return `/api/media/${normalizedKey}`;
}

export async function readMediaObject(key: string): Promise<R2ObjectLike | null> {
  const normalizedKey = key.replace(/^\/+/, '');
  const { mediaBucket } = await getCloudflareBindings();
  if (mediaBucket) {
    return mediaBucket.get(normalizedKey);
  }

  const filePath = path.join(mediaRoot, normalizedKey);
  try {
    const buffer = await fs.readFile(filePath);
    return {
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      httpMetadata: { contentType: getContentTypeForPath(filePath) }
    };
  } catch {
    return null;
  }
}

function getContentTypeForPath(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    default:
      return undefined;
  }
}
