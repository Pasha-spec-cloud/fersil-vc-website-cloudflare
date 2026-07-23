import fs from 'node:fs/promises';
import path from 'node:path';

import { z } from 'zod';

import {
  companiesSchema,
  teamMembersSchema,
  newsItemsSchema
} from '@/schemas/content';
import bundledCompanies from '@/content/companies.json';
import bundledTeam from '@/content/team.json';
import bundledNews from '@/content/news.json';
import type { Company, TeamMember, NewsItem, ContentBundle } from '@/types/content';
import { isCloudflareStorageEnabled, readContentFile, writeContentFile } from '@/lib/storage';

type ResourceMap = {
  companies: {
    file: string;
    schema: typeof companiesSchema;
  };
  team: {
    file: string;
    schema: typeof teamMembersSchema;
  };
  news: {
    file: string;
    schema: typeof newsItemsSchema;
  };
};

const resources: ResourceMap = {
  companies: { file: 'companies.json', schema: companiesSchema },
  team: { file: 'team.json', schema: teamMembersSchema },
  news: { file: 'news.json', schema: newsItemsSchema }
};

type ResourceName = keyof ResourceMap;

type ResourceData<TName extends ResourceName> = z.infer<ResourceMap[TName]['schema']>;

const bundledResources = {
  companies: bundledCompanies,
  team: bundledTeam,
  news: bundledNews
} satisfies Record<ResourceName, unknown>;

type CacheEntry<T> = {
  mtimeMs?: number;
  data: T;
};

const contentRoot = path.join(process.cwd(), 'content');
const cache = new Map<ResourceName, CacheEntry<unknown>>();

type LoadOptions = {
  includeDrafts?: boolean;
};

async function getFileMTime(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.mtimeMs;
}

async function readResource<TName extends ResourceName>(name: TName): Promise<ResourceData<TName>> {
  const config = resources[name];
  const existing = cache.get(name);
  const useRemoteStorage = await isCloudflareStorageEnabled();

  if (useRemoteStorage) {
    try {
      const raw = await readContentFile(config.file);
      const parsed = config.schema.parse(JSON.parse(raw));
      return parsed as ResourceData<TName>;
    } catch (error) {
      console.error(`Unable to read ${config.file} from Cloudflare storage; using bundled content.`, error);
      return config.schema.parse(bundledResources[name]) as ResourceData<TName>;
    }
  }

  const filePath = path.join(contentRoot, config.file);
  const mtimeMs = await getFileMTime(filePath);

  if (existing && existing.mtimeMs === mtimeMs) {
    return existing.data as ResourceData<TName>;
  }

  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = config.schema.parse(JSON.parse(raw));
  cache.set(name, { mtimeMs, data: parsed });
  return parsed as ResourceData<TName>;
}

async function writeResource<TName extends ResourceName>(name: TName, data: ResourceData<TName>): Promise<ResourceData<TName>> {
  const config = resources[name];
  const filePath = path.join(contentRoot, config.file);
  const parsed = config.schema.parse(data);
  const payload = `${JSON.stringify(parsed, null, 2)}\n`;
  const useRemoteStorage = await isCloudflareStorageEnabled();

  if (useRemoteStorage) {
    await writeContentFile(config.file, payload);
    return parsed;
  }

  await fs.mkdir(contentRoot, { recursive: true });
  await fs.writeFile(filePath, payload, 'utf8');
  const mtimeMs = await getFileMTime(filePath);
  cache.set(name, { mtimeMs, data: parsed });

  return parsed;
}

function filterDrafts<T extends { draft?: boolean; hidden?: boolean }>(items: T[], includeDrafts?: boolean): T[] {
  if (includeDrafts) {
    return items;
  }
  return items.filter((item) => !item.draft && !item.hidden);
}

export async function getCompanies(options: LoadOptions = {}): Promise<Company[]> {
  const companies = await readResource('companies');
  const filtered = filterDrafts(companies, options.includeDrafts);

  return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCompanyBySlug(slug: string, options?: LoadOptions): Promise<Company | undefined> {
  const companies = await getCompanies(options);
  return companies.find((company) => company.slug === slug);
}

export async function getCompanyById(id: string, options?: LoadOptions): Promise<Company | undefined> {
  const companies = await getCompanies(options);
  return companies.find((company) => company.id === id);
}

export async function getTeamMembers(options: LoadOptions = {}): Promise<TeamMember[]> {
  const team = await readResource('team');
  const filtered = filterDrafts(team, options.includeDrafts);
  return [...filtered].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
  });
}

type NewsOptions = LoadOptions & {
  limit?: number;
};

const PUBLIC_NEWS_START = Date.UTC(2021, 0, 1);

export function isPublicNewsItem(item: Pick<NewsItem, 'publishedAt'>): boolean {
  return new Date(item.publishedAt).getTime() >= PUBLIC_NEWS_START;
}

export async function getNewsItems(options: NewsOptions = {}): Promise<NewsItem[]> {
  const news = await readResource('news');
  const visible = filterDrafts(news, options.includeDrafts);
  const filtered = (options.includeDrafts ? visible : visible.filter(isPublicNewsItem)).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (options.limit) {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getContentBundle(options: LoadOptions = {}): Promise<ContentBundle> {
  const [companies, team, news] = await Promise.all([
    getCompanies(options),
    getTeamMembers(options),
    getNewsItems(options)
  ]);

  return { companies, team, news };
}

export async function saveCompanies(companies: Company[]): Promise<Company[]> {
  return writeResource('companies', companies);
}

export async function saveTeamMembers(team: TeamMember[]): Promise<TeamMember[]> {
  return writeResource('team', team);
}

export async function saveNewsItems(news: NewsItem[]): Promise<NewsItem[]> {
  return writeResource('news', news);
}

export async function mutateResource<TName extends ResourceName>(
  name: TName,
  updater: (current: ResourceData<TName>) => ResourceData<TName>
): Promise<ResourceData<TName>> {
  const current = await readResource(name);
  const updated = updater(current);
  return writeResource(name, updated);
}

export function clearContentCache(): void {
  cache.clear();
}
