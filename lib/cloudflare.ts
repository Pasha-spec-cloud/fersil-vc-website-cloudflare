type CloudflareEnv = Record<string, unknown>;

type CloudflareContext = {
  env?: CloudflareEnv;
};

type GetCloudflareContext = (options?: { async?: boolean }) => CloudflareContext | Promise<CloudflareContext>;

export type R2ObjectLike = {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: {
    contentType?: string;
  };
  writeHttpMetadata?(headers: Headers): void;
  etag?: string;
};

export type R2BucketLike = {
  get(key: string): Promise<R2ObjectLike | null>;
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    }
  ): Promise<unknown>;
};

type CloudflareBindings = {
  contentBucket: R2BucketLike | null;
  mediaBucket: R2BucketLike | null;
};

const DEFAULT_CONTENT_BINDING = 'FERSIL_CONTENT';
const DEFAULT_MEDIA_BINDING = 'FERSIL_MEDIA';

function getBindingName(kind: 'content' | 'media'): string {
  if (kind === 'content') {
    return process.env.CLOUDFLARE_CONTENT_BUCKET_BINDING ?? DEFAULT_CONTENT_BINDING;
  }
  return process.env.CLOUDFLARE_MEDIA_BUCKET_BINDING ?? DEFAULT_MEDIA_BINDING;
}

async function loadCloudflareEnv(): Promise<CloudflareEnv | null> {
  try {
    const mod = (await import('@opennextjs/cloudflare')) as {
      getCloudflareContext?: GetCloudflareContext;
    };
    if (!mod.getCloudflareContext) {
      return null;
    }

    const context = await mod.getCloudflareContext({ async: true });
    return context?.env ?? null;
  } catch {
    return null;
  }
}

export async function getCloudflareBindings(): Promise<CloudflareBindings> {
  const env = await loadCloudflareEnv();
  if (!env) {
    return {
      contentBucket: null,
      mediaBucket: null
    };
  }

  const contentBucket = env[getBindingName('content')];
  const mediaBucket = env[getBindingName('media')];

  return {
    contentBucket: isR2BucketLike(contentBucket) ? contentBucket : null,
    mediaBucket: isR2BucketLike(mediaBucket) ? mediaBucket : null
  };
}

function isR2BucketLike(value: unknown): value is R2BucketLike {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'get' in value &&
      typeof (value as { get?: unknown }).get === 'function' &&
      'put' in value &&
      typeof (value as { put?: unknown }).put === 'function'
  );
}
