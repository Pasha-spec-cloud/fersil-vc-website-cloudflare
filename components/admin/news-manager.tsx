'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdminInput, AdminTextarea, labelStyles } from '@/components/admin/form-controls';
import type { NewsItem } from '@/types/content';
import { newsItemSchema } from '@/schemas/content';
import { slugify } from '@/lib/utils';

type NewsManagerProps = {
  initialNews: NewsItem[];
};

type NewsFormValues = {
  id?: string;
  title: string;
  summary?: string;
  link?: string;
  publishedAt: string;
  featured: boolean;
  imageUrl?: string;
  logoPreference?: string;
  draft: boolean;
  hidden: boolean;
  imageFile?: FileList;
};

export function NewsManager({ initialNews }: NewsManagerProps) {
  const [items, setItems] = useState(initialNews);
  const [selected, setSelected] = useState<NewsItem | null>(initialNews[0] ?? null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<{ message?: string; error?: string }>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<NewsFormValues>({ defaultValues: newsToFormValues(selected) });

  useEffect(() => {
    form.reset(newsToFormValues(selected));
  }, [form, selected]);

  const filtered = useMemo(() => {
    if (!query) {
      return items;
    }
    const lower = query.toLowerCase();
    return items.filter((item) => `${item.title} ${item.summary ?? ''}`.toLowerCase().includes(lower));
  }, [items, query]);

  const handleSubmit = form.handleSubmit((values) => {
    setStatus({});
    startTransition(async () => {
      try {
        const { payload, imageFile } = buildNewsPayload(values);
        const endpoint = selected ? `/api/admin/news/${payload.id}` : '/api/admin/news';
        const method = selected ? 'PATCH' : 'POST';
        const response = await fetch(endpoint, {
          method,
          body: createNewsFormData(payload, imageFile),
          credentials: 'include'
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to save news item');
        }
        const saved: NewsItem = body.data;
        setItems((prev) => {
          const next = prev.filter((item) => item.id !== saved.id);
          next.push(saved);
          next.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          return next;
        });
        setSelected(saved);
        form.reset(newsToFormValues(saved));
        setStatus({ message: 'News saved.' });
      } catch (error) {
        setStatus({ error: error instanceof Error ? error.message : 'Unable to save news item' });
      }
    });
  });

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`Delete ${selected.title}?`)) {
      return;
    }
    setStatus({});
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/news/${selected.id}`, { method: 'DELETE', credentials: 'include' });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to delete news item');
        }
        const nextItems = items.filter((item) => item.id !== selected.id);
        setItems(nextItems);
        const nextSelected = nextItems[0] ?? null;
        setSelected(nextSelected);
        form.reset(newsToFormValues(nextSelected));
        setStatus({ message: 'News removed.' });
      } catch (error) {
        setStatus({ error: error instanceof Error ? error.message : 'Unable to delete news item' });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
      <Card title="News" eyebrow="Stories">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <label className={labelStyles}>Search</label>
            <AdminInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by title or summary" />
          </div>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            + New story
          </Button>
        </div>
        <div className="mt-6 max-h-[60vh] overflow-auto rounded-2xl border border-white/5">
          {filtered.map((item) => {
            const isActive = selected?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                className={`flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm transition last:border-none ${
                  isActive ? 'bg-primary/10 text-white' : 'hover:bg-white/5'
                }`}
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{new Date(item.publishedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                  {item.featured ? 'Featured' : ''}
                  {item.draft ? 'Draft' : ''}
                  {item.hidden ? 'Hidden' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      <Card title={selected ? 'Edit story' : 'Add story'} eyebrow="Details">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Title</label>
              <AdminInput {...form.register('title', { required: true })} placeholder="Headline" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Published at</label>
              <AdminInput {...form.register('publishedAt', { required: true })} type="datetime-local" />
            </div>
            <div>
              <label className={labelStyles}>Logo preference</label>
              <AdminInput {...form.register('logoPreference')} placeholder="Logo or Photo" />
            </div>
          </div>
          <div>
            <label className={labelStyles}>Summary</label>
            <AdminTextarea rows={3} {...form.register('summary')} placeholder="Short summary" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Link</label>
              <AdminInput {...form.register('link')} placeholder="https://example.com/story" />
            </div>
            <div>
              <label className={labelStyles}>Image URL</label>
              <AdminInput {...form.register('imageUrl')} placeholder="/media/news.jpg" />
            </div>
          </div>
          <div>
            <label className={labelStyles}>Upload image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              {...form.register('imageFile')}
            />
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...form.register('featured')} />
              Feature this story
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...form.register('draft')} />
              Draft
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...form.register('hidden')} />
              Hidden
            </label>
          </div>
          {status.error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{status.error}</p>}
          {status.message && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{status.message}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save story'}
            </Button>
            {selected && (
              <Button type="button" variant="ghost" onClick={handleDelete} disabled={isPending}>
                Delete story
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

function newsToFormValues(item: NewsItem | null): NewsFormValues {
  if (!item) {
    return {
      title: '',
      summary: '',
      link: '',
      publishedAt: new Date().toISOString().slice(0, 16),
      featured: false,
      imageUrl: '',
      logoPreference: '',
      draft: false,
      hidden: false
    };
  }
  return {
    id: item.id,
    title: item.title,
    summary: item.summary ?? '',
    link: item.link ?? '',
    publishedAt: formatDateForInput(item.publishedAt),
    featured: Boolean(item.featured),
    imageUrl: item.imageUrl ?? '',
    logoPreference: item.logoPreference ?? '',
    draft: Boolean(item.draft),
    hidden: Boolean(item.hidden)
  };
}

function buildNewsPayload(values: NewsFormValues): { payload: NewsItem; imageFile?: File } {
  const payload = newsItemSchema.parse({
    id: values.id?.trim() || crypto.randomUUID(),
    title: values.title.trim(),
    slug: slugify(values.title.trim()),
    summary: values.summary?.trim() || undefined,
    link: values.link?.trim() || undefined,
    publishedAt: values.publishedAt,
    featured: Boolean(values.featured),
    imageUrl: values.imageUrl?.trim() || undefined,
    logoPreference: values.logoPreference?.trim() || undefined,
    draft: Boolean(values.draft),
    hidden: Boolean(values.hidden)
  });
  return { payload, imageFile: values.imageFile?.[0] };
}

function createNewsFormData(payload: NewsItem, imageFile?: File): FormData {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  if (imageFile) {
    formData.append('image', imageFile);
  }
  return formData;
}

function formatDateForInput(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
