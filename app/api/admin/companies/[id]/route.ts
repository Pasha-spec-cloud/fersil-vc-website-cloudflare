import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/auth';
import { mutateResource } from '@/lib/content';
import { saveUploadedFile } from '@/lib/uploads';
import { revalidatePath } from 'next/cache';
import { companySchema } from '@/schemas/content';
import type { Company } from '@/types/content';
import { slugify } from '@/lib/utils';

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

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  assertAdminSession();
  const { id } = context.params;
  try {
    const { payload, logoFile } = await parseCompanyRequest(request);
    payload.id = id;
    if (logoFile) {
      payload.logo = await saveUploadedFile(logoFile, { prefix: 'companies' });
    }
    let previousSlug: string | undefined;
    const updated = await mutateResource('companies', (companies) => {
      const next = companies.filter((company) => {
        if (company.id === id) {
          previousSlug = company.slug;
          return false;
        }
        return true;
      });
      if (!previousSlug) {
        throw new Error('Not found');
      }
      next.push(payload);
      return sortCompanies(next);
    });
    revalidateCompanyPaths(payload.slug, previousSlug);
    const saved = updated.find((company) => company.id === id);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  assertAdminSession();
  const { id } = context.params;
  try {
    let removedSlug: string | undefined;
    await mutateResource('companies', (companies) => {
      const next = companies.filter((company) => {
        if (company.id === id) {
          removedSlug = company.slug;
          return false;
        }
        return true;
      });
      if (!removedSlug) {
        throw new Error('Not found');
      }
      return sortCompanies(next);
    });
    if (removedSlug) {
      revalidateCompanyPaths(removedSlug);
    }
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleError(error);
  }
}
