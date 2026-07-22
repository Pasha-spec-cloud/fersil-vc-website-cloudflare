import type { NextRequest } from 'next/server';

import { readMediaObject } from '@/lib/storage';

type RouteContext = {
  params: {
    key?: string[];
  };
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const segments = (context.params.key ?? []).filter(Boolean);
  if (segments.length === 0 || segments.some((segment) => segment === '.' || segment === '..')) {
    return new Response('Not found', { status: 404 });
  }

  const object = await readMediaObject(segments.join('/'));
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = new Headers();
  if (typeof object.writeHttpMetadata === 'function') {
    object.writeHttpMetadata(headers);
  } else if (object.httpMetadata?.contentType) {
    headers.set('content-type', object.httpMetadata.contentType);
  }
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  if (object.etag) {
    headers.set('etag', object.etag);
  }

  return new Response(await object.arrayBuffer(), {
    status: 200,
    headers
  });
}
