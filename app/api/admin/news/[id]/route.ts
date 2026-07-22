import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/auth';
import { mutateResource } from '@/lib/content';
import { saveUploadedFile } from '@/lib/uploads';
import { revalidatePath } from 'next/cache';
import { newsItemSchema } from '@/schemas/content';
import type { NewsItem } from '@/types/content';
import { slugify } from '@/lib/utils';

function sortNewsItems(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function revalidateNewsPaths() {
  revalidatePath('/');
  revalidatePath('/news');
}

async function parseNewsRequest(request: NextRequest): Promise<{ payload: NewsItem; imageFile?: File }> {
  const formData = await request.formData();
  const raw = formData.get('payload');
  if (typeof raw !== 'string') {
    throw new Error('Missing payload');
  }
  const input = JSON.parse(raw) as any;
  if (!input.slug || String(input.slug).trim() === '') {
    input.slug = slugify(String(input.title ?? ''));
  }
  const payload = newsItemSchema.parse(input) as NewsItem;
  const image = formData.get('image');
  return { payload, imageFile: image instanceof File ? image : undefined };
}

function handleError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const status = message === 'Not found' ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  assertAdminSession();
  const { id } = context.params;
  try {
    const { payload, imageFile } = await parseNewsRequest(request);
    payload.id = id;
    if (imageFile) {
      payload.imageUrl = await saveUploadedFile(imageFile, { prefix: 'news' });
    }
    const updated = await mutateResource('news', (items) => {
      const exists = items.some((item) => item.id === id);
      if (!exists) {
        throw new Error('Not found');
      }
      const next = items.filter((item) => item.id !== id);
      next.push(payload);
      return sortNewsItems(next);
    });
    revalidateNewsPaths();
    const saved = updated.find((item) => item.id === id);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  assertAdminSession();
  const { id } = context.params;
  try {
    let removed = false;
    await mutateResource('news', (items) => {
      const next = items.filter((item) => {
        if (item.id === id) {
          removed = true;
          return false;
        }
        return true;
      });
      if (!removed) {
        throw new Error('Not found');
      }
      return sortNewsItems(next);
    });
    revalidateNewsPaths();
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleError(error);
  }
}
