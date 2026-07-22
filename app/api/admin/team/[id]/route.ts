import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/auth';
import { mutateResource } from '@/lib/content';
import { saveUploadedFile } from '@/lib/uploads';
import { revalidatePath } from 'next/cache';
import { teamMemberSchema } from '@/schemas/content';
import type { TeamMember } from '@/types/content';
import { slugify } from '@/lib/utils';

function sortTeamMembers(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
  });
}

function revalidateTeamPaths(companySlugs: string[], previousCompanySlugs: string[] = []) {
  revalidatePath('/');
  revalidatePath('/team');
  const uniqueSlugs = new Set([...companySlugs, ...previousCompanySlugs]);
  uniqueSlugs.forEach((slug) => {
    if (slug) {
      revalidatePath(`/companies/${slug}`);
    }
  });
}

async function parseTeamRequest(request: NextRequest): Promise<{
  payload: TeamMember;
  headshotFile?: File;
  heroImageFile?: File;
}> {
  const formData = await request.formData();
  const raw = formData.get('payload');
  if (typeof raw !== 'string') {
    throw new Error('Missing payload');
  }
  const input = JSON.parse(raw) as any;
  if (!input.slug || String(input.slug).trim() === '') {
    input.slug = slugify(String(input.name ?? ''));
  }
  const payload = teamMemberSchema.parse(input) as TeamMember;
  const headshot = formData.get('headshot');
  const hero = formData.get('hero');
  return {
    payload,
    headshotFile: headshot instanceof File ? headshot : undefined,
    heroImageFile: hero instanceof File ? hero : undefined
  };
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
    const { payload, headshotFile, heroImageFile } = await parseTeamRequest(request);
    payload.id = id;
    if (headshotFile) {
      payload.headshotUrl = await saveUploadedFile(headshotFile, { prefix: 'team' });
    }
    if (heroImageFile) {
      payload.heroImageUrl = await saveUploadedFile(heroImageFile, { prefix: 'team' });
    }
    let previousCompanySlugs: string[] = [];
    const updated = await mutateResource('team', (members) => {
      const existing = members.find((member) => member.id === id);
      if (!existing) {
        throw new Error('Not found');
      }
      previousCompanySlugs = existing.companySlugs;
      const next = members.filter((member) => member.id !== id);
      next.push(payload);
      return sortTeamMembers(next);
    });
    revalidateTeamPaths(payload.companySlugs, previousCompanySlugs);
    const saved = updated.find((member) => member.id === id);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  assertAdminSession();
  const { id } = context.params;
  try {
    let previousCompanySlugs: string[] = [];
    let found = false;
    await mutateResource('team', (members) => {
      const next = members.filter((member) => {
        if (member.id === id) {
          previousCompanySlugs = member.companySlugs;
          found = true;
          return false;
        }
        return true;
      });
      if (!found) {
        throw new Error('Not found');
      }
      return sortTeamMembers(next);
    });
    revalidateTeamPaths([], previousCompanySlugs);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleError(error);
  }
}
