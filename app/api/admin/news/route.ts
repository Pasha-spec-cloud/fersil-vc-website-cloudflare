import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/auth';
import { getNewsItems, mutateResource } from '@/lib/content';
import { saveUploadedFile } from '@/lib/uploads';
import { newsItemSchema } from '@/schemas/content';
import type { NewsItem } from '@/types/content';
import { slugify } from '@/lib/utils';

export async function GET() {
  await assertAdminSession();
  const news = await getNewsItems({ includeDrafts: true });
  return NextResponse.json({ data: news });
}

export async function POST(request: NextRequest) {
  await assertAdminSession();
  try {
    const { payload, imageFile } = await parseNewsRequest(request);
    if (imageFile) {
      payload.imageUrl = await saveUploadedFile(imageFile, { prefix: 'news' });
    }
    const updated = await mutateResource('news', (items) => sortNewsItems([...items.filter((item) => item.id !== payload.id), payload]));
    revalidateNewsPaths();
    const saved = updated.find((item) => item.id === payload.id);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return handleError(error);
  }
}

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
