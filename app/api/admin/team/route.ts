import { revalidatePath } from 'next/cache';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/auth';
import { getTeamMembers, mutateResource } from '@/lib/content';
import { saveUploadedFile } from '@/lib/uploads';
import { teamMemberSchema } from '@/schemas/content';
import type { TeamMember } from '@/types/content';
import { slugify } from '@/lib/utils';

export async function GET() {
  await assertAdminSession();
  const team = await getTeamMembers({ includeDrafts: true });
  return NextResponse.json({ data: team });
}

export async function POST(request: NextRequest) {
  await assertAdminSession();
  try {
    const { payload, headshotFile, heroImageFile } = await parseTeamRequest(request);
    if (headshotFile) {
      payload.headshotUrl = await saveUploadedFile(headshotFile, { prefix: 'team' });
    }
    if (heroImageFile) {
      payload.heroImageUrl = await saveUploadedFile(heroImageFile, { prefix: 'team' });
    }
    const updated = await mutateResource('team', (members) => sortTeamMembers([...members.filter((member) => member.id !== payload.id), payload]));
    revalidateTeamPaths(payload.companySlugs);
    const saved = updated.find((member) => member.id === payload.id);
    return NextResponse.json({ data: saved });
  } catch (error) {
    return handleError(error);
  }
}

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
