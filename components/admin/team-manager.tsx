'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdminInput, AdminTextarea, labelStyles } from '@/components/admin/form-controls';
import type { Company, TeamMember } from '@/types/content';
import { teamMemberSchema } from '@/schemas/content';
import { slugify } from '@/lib/utils';

type TeamManagerProps = {
  initialTeam: TeamMember[];
  companies: Company[];
};

type TeamFormValues = {
  id?: string;
  name: string;
  role: string;
  order?: string;
  bio?: string;
  headshotUrl?: string;
  heroImageUrl?: string;
  stats: string;
  socialLinks: string;
  featureLinks: string;
  companySlugs: string;
  draft: boolean;
  hidden: boolean;
  headshotFile?: FileList;
  heroImageFile?: FileList;
};

export function TeamManager({ initialTeam, companies }: TeamManagerProps) {
  const [team, setTeam] = useState(initialTeam);
  const [selected, setSelected] = useState<TeamMember | null>(initialTeam[0] ?? null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<{ message?: string; error?: string }>({});
  const [isPending, startTransition] = useTransition();
  const form = useForm<TeamFormValues>({
    defaultValues: memberToFormValues(selected)
  });

  useEffect(() => {
    form.reset(memberToFormValues(selected));
  }, [form, selected]);

  const filteredTeam = useMemo(() => {
    if (!query) {
      return team;
    }
    const lower = query.toLowerCase();
    return team.filter((member) => `${member.name} ${member.role}`.toLowerCase().includes(lower));
  }, [query, team]);

  const companiesList = companies.map((company) => company.slug).sort();

  const handleSubmit = form.handleSubmit((values) => {
    setStatus({});
    startTransition(async () => {
      try {
        const { payload, headshotFile, heroImageFile } = buildTeamPayload(values, selected ?? undefined);
        const endpoint = selected ? `/api/admin/team/${payload.id}` : '/api/admin/team';
        const method = selected ? 'PATCH' : 'POST';
        const response = await fetch(endpoint, {
          method,
          body: createTeamFormData(payload, headshotFile, heroImageFile),
          credentials: 'include'
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to save team member');
        }
        const saved: TeamMember = body.data;
        setTeam((prev) => {
          const next = prev.filter((member) => member.id !== saved.id);
          next.push(saved);
          next.sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name));
          return next;
        });
        setSelected(saved);
        form.reset(memberToFormValues(saved));
        setStatus({ message: 'Team member saved.' });
      } catch (error) {
        setStatus({ error: error instanceof Error ? error.message : 'Unable to save team member' });
      }
    });
  });

  async function handleDelete() {
    if (!selected) return;
    if (!confirm(`Delete ${selected.name}?`)) {
      return;
    }
    setStatus({});
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/team/${selected.id}`, { method: 'DELETE', credentials: 'include' });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to delete team member');
        }
        const nextTeam = team.filter((member) => member.id !== selected.id);
        setTeam(nextTeam);
        const nextSelected = nextTeam[0] ?? null;
        setSelected(nextSelected);
        form.reset(memberToFormValues(nextSelected));
        setStatus({ message: 'Team member removed.' });
      } catch (error) {
        setStatus({ error: error instanceof Error ? error.message : 'Unable to delete team member' });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
      <Card title="Team" eyebrow="Roster">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <label className={labelStyles}>Search</label>
            <AdminInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by name or role" />
          </div>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            + New member
          </Button>
        </div>
        <div className="mt-6 max-h-[60vh] overflow-auto rounded-2xl border border-white/5">
          {filteredTeam.map((member) => {
            const isActive = selected?.id === member.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelected(member)}
                className={`flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm transition last:border-none ${
                  isActive ? 'bg-primary/10 text-white' : 'hover:bg-white/5'
                }`}
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted">{member.role}</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                  {member.draft ? 'Draft' : ''}
                  {member.hidden ? 'Hidden' : ''}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      <Card title={selected ? 'Edit member' : 'Add member'} eyebrow="Details">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Name</label>
              <AdminInput {...form.register('name', { required: true })} placeholder="Full name" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Role</label>
              <AdminInput {...form.register('role', { required: true })} placeholder="General Partner" />
            </div>
            <div>
              <label className={labelStyles}>Order</label>
              <AdminInput {...form.register('order')} type="number" placeholder="Optional sort order" />
            </div>
          </div>
          <div>
            <label className={labelStyles}>Bio (plain text)</label>
            <AdminTextarea rows={12} className="min-h-[240px]" {...form.register('bio')} placeholder="Short bio" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Headshot URL</label>
              <AdminInput {...form.register('headshotUrl')} placeholder="/media/headshot.jpg" />
            </div>
            <div>
              <label className={labelStyles}>Upload headshot</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                {...form.register('headshotFile')}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Hero image URL</label>
              <AdminInput {...form.register('heroImageUrl')} placeholder="/media/hero.jpg" />
            </div>
            <div>
              <label className={labelStyles}>Upload hero image</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                {...form.register('heroImageFile')}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Stats (Label|Value per line)</label>
              <AdminTextarea rows={3} {...form.register('stats')} placeholder="Year joined|2020&#10;Region|Europe" />
            </div>
            <div>
              <label className={labelStyles}>Social links (Label|URL per line)</label>
              <AdminTextarea rows={3} {...form.register('socialLinks')} placeholder="LinkedIn|https://linkedin.com/…" />
            </div>
          </div>
          <div>
            <label className={labelStyles}>Featured links (Label|URL per line)</label>
            <AdminTextarea rows={3} {...form.register('featureLinks')} placeholder="Article name|https://example.com" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>Company slugs (one per line)</label>
              <AdminTextarea rows={3} {...form.register('companySlugs')} placeholder="company-slug" />
              <HelperChips title="Available company slugs" items={companiesList} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted">
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
              {isPending ? 'Saving…' : 'Save member'}
            </Button>
            {selected && (
              <Button type="button" variant="ghost" onClick={handleDelete} disabled={isPending}>
                Delete
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

function memberToFormValues(member: TeamMember | null): TeamFormValues {
  if (!member) {
    return {
      name: '',
      role: '',
      order: '',
      bio: '',
      headshotUrl: '',
      heroImageUrl: '',
      stats: '',
      socialLinks: '',
      featureLinks: '',
      companySlugs: '',
      draft: false,
      hidden: false
    };
  }
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    order: member.order ? String(member.order) : '',
    bio: member.bio ?? '',
    headshotUrl: member.headshotUrl ?? '',
    heroImageUrl: member.heroImageUrl ?? '',
    stats: member.stats.map((stat) => `${stat.label}|${stat.value}`).join('\n'),
    socialLinks: member.socialLinks.map((link) => `${link.label}|${link.url}`).join('\n'),
    featureLinks: member.featureLinks.map((link) => `${link.label}|${link.url}`).join('\n'),
    companySlugs: member.companySlugs.join('\n'),
    draft: Boolean(member.draft),
    hidden: Boolean((member as any).hidden)
  };
}

function buildTeamPayload(values: TeamFormValues, current?: TeamMember): {
  payload: TeamMember;
  headshotFile?: File;
  heroImageFile?: File;
} {
  const payload = teamMemberSchema.parse({
    id: values.id?.trim() || crypto.randomUUID(),
    name: values.name.trim(),
    slug: slugify(values.name.trim()),
    role: values.role.trim(),
    bio: values.bio?.trim() || undefined,
    headshotUrl: values.headshotUrl?.trim() || undefined,
    heroImageUrl: values.heroImageUrl?.trim() || undefined,
    stats: parsePairs(values.stats).map(([label, value]) => ({ label, value })),
    socialLinks: parsePairs(values.socialLinks).map(([label, url]) => ({ label, url })),
    featureLinks: parsePairs(values.featureLinks).map(([label, url]) => ({ label, url })),
    companySlugs: toList(values.companySlugs),
    newsSlugs: current?.newsSlugs ?? [],
    order: values.order ? Number(values.order) : undefined,
    draft: Boolean(values.draft),
    hidden: Boolean(values.hidden)
  });

  return {
    payload,
    headshotFile: values.headshotFile?.[0],
    heroImageFile: values.heroImageFile?.[0]
  };
}

function createTeamFormData(payload: TeamMember, headshotFile?: File, heroImageFile?: File): FormData {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  if (headshotFile) {
    formData.append('headshot', headshotFile);
  }
  if (heroImageFile) {
    formData.append('hero', heroImageFile);
  }
  return formData;
}

function parsePairs(value: string): [string, string][] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter((parts) => parts.length >= 2)
    .map(([label, second]) => [label, second]);
}

function toList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function HelperChips({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="mt-2 space-y-1 text-xs text-muted">
      <p>{title}:</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-white/10 px-2 py-0.5">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
