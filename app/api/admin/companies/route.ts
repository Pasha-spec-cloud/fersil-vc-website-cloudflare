import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/auth';
import { getCompanies, mutateResource } from '@/lib/content';
import { saveUploadedFile } from '@/lib/uploads';
import { companySchema } from '@/schemas/content';
import type { Company } from '@/types/content';
import { slugify } from '@/lib/utils';

export async function GET() {
  await assertAdminSession();
  const companies = await getCompanies({ includeDrafts: true });
  return NextResponse.json({ data: companies });
}

export async function POST(request: NextRequest) {
  await assertAdminSession();
  try {
    const { payload, logoFile } = await parseCompanyRequest(request);
    if (logoFile) {
      payload.logo = await saveUploadedFile(logoFile, { prefix: 'companies' });
    }
    const updated = await mutateResource('companies', (companies) => sortCompanies([...companies.filter((company) => company.id !== payload.id), payload]));
    revalidateCompanyPaths(payload.slug);
    const saved = updated.find((company) => company.id === payload.id);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return handleError(error);
  }
}

function revalidateCompanyPaths(slug: string, previousSlug?: string) {
  revalidatePath('/');
  revalidatePath('/companies');
  revalidatePath(`/companies/${slug}`);
  revalidatePath('/team');
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/companies/${previousSlug}`);
  }
}

function sortCompanies(companies: Company[]): Company[] {
  return [...companies].sort((a, b) => a.name.localeCompare(b.name));
}

async function parseCompanyRequest(request: NextRequest): Promise<{ payload: Company; logoFile?: File }> {
  const formData = await request.formData();
  const raw = formData.get('payload');
  if (typeof raw !== 'string') {
    throw new Error('Missing payload');
  }
  const input = JSON.parse(raw) as any;
  if (!input.slug || String(input.slug).trim() === '') {
    input.slug = slugify(String(input.name ?? ''));
  }
  const payload = companySchema.parse(input) as Company;
  const logo = formData.get('logo');
  return { payload, logoFile: logo instanceof File ? logo : undefined };
}

function handleError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const status = message === 'Not found' ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
