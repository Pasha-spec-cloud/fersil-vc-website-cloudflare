'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdminInput, AdminSelect, AdminTextarea, labelStyles } from '@/components/admin/form-controls';
import { companySchema } from '@/schemas/content';
import type { Company } from '@/types/content';
import { slugify } from '@/lib/utils';

type LinkInput = { label: string; url: string };
type FactItemInput = { text: string; url?: string };
type FactInput = { title: string; items: FactItemInput[] };

type CompanyFormValues = {
  id?: string;
  name: string;
  status: Company['status'];
  focusAreas: Company['focusAreas'];
  tagline?: string;
  description?: string;
  stage?: string;
  firstInvestmentYear?: string;
  founders: string;
  ceo?: string;
  coInvestors: string;
  officeLocations: string;
  website?: string;
  linkedin?: string;
  links: LinkInput[];
  facts: FactInput[];
  logo?: string;
  logoFile?: FileList;
  draft: boolean;
  hidden: boolean;
};

type CompaniesManagerProps = {
  initialCompanies: Company[];
};

export function CompaniesManager({ initialCompanies }: CompaniesManagerProps) {
  const [companies, setCompanies] = useState(initialCompanies);
  const [selected, setSelected] = useState<Company | null>(initialCompanies[0] ?? null);
  const [query, setQuery] = useState('');
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CompanyFormValues>({
    defaultValues: companyToFormValues(selected)
  });

  useEffect(() => {
    form.reset(companyToFormValues(selected));
  }, [form, selected]);
  const currentLinks = form.watch('links');
  const currentFacts = form.watch('facts');
  const linksData = currentLinks ?? [];
  const factsData = currentFacts ?? [];
  const linksFields = (linksData.length > 0 ? linksData : [{ label: '', url: '' }]) as LinkInput[];
  const factsFields = (factsData.length > 0 ? factsData : [{ title: '', items: [{ text: '', url: '' }] }]) as FactInput[];

  const filteredCompanies = useMemo(() => {
    if (!query) {
      return companies;
    }
    const lower = query.toLowerCase();
    return companies.filter((company) => `${company.name} ${company.stage ?? ''} ${company.tagline ?? ''}`.toLowerCase().includes(lower));
  }, [companies, query]);

  const isEditing = Boolean(selected);

  const handleSubmit = form.handleSubmit((values) => {
    setServerError(null);
    setServerMessage(null);
    startTransition(async () => {
      try {
        const { payload, file } = buildCompanyPayload(values);
        const endpoint = selected ? `/api/admin/companies/${payload.id}` : '/api/admin/companies';
        const method = selected ? 'PATCH' : 'POST';
        const response = await fetch(endpoint, {
          method,
          body: createCompanyFormData(payload, file),
          credentials: 'include'
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to save company');
        }
        const saved: Company = body.data;
        setCompanies((prev) => {
          const next = prev.filter((company) => company.id !== saved.id);
          next.push(saved);
          next.sort((a, b) => a.name.localeCompare(b.name));
          return next;
        });
        setSelected(saved);
        form.reset(companyToFormValues(saved));
        setServerMessage('Company saved.');
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Unable to save company');
      }
    });
  });

  async function handleDelete() {
    if (!selected) {
      return;
    }
    if (!confirm(`Delete ${selected.name}? This cannot be undone.`)) {
      return;
    }
    setServerError(null);
    setServerMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/companies/${selected.id}`, { method: 'DELETE', credentials: 'include' });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error ?? 'Unable to delete company');
        }
        const nextCompanies = companies.filter((company) => company.id !== selected.id);
        setCompanies(nextCompanies);
        const nextSelected = nextCompanies[0] ?? null;
        setSelected(nextSelected);
        form.reset(companyToFormValues(nextSelected));
        setServerMessage('Company removed.');
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Unable to delete company');
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
      <Card title="Companies" eyebrow="Dataset">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <label className={labelStyles}>Search</label>
            <AdminInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter by name or stage" />
          </div>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            + New company
          </Button>
        </div>
        <div className="mt-6 max-h-[60vh] overflow-auto rounded-2xl border border-white/5">
          {filteredCompanies.length === 0 && <p className="p-6 text-sm text-muted">No companies match your search.</p>}
          {filteredCompanies.map((company) => {
            const isActive = selected?.id === company.id;
            return (
              <button
                key={company.id}
                type="button"
                onClick={() => setSelected(company)}
                className={`flex w-full items-center justify-between gap-3 border-b border-white/5 px-4 py-3 text-left text-sm transition last:border-none ${
                  isActive ? 'bg-primary/10 text-white' : 'hover:bg-white/5'
                }`}
              >
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-xs text-muted">{company.stage ?? 'Stage TBD'}</p>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                  <span className={company.status === 'active' ? 'text-emerald-300' : 'text-muted'}>{company.status}</span>
                  {company.draft && <span className="text-amber-300">Draft</span>}
                  {company.hidden && <span className="text-amber-300">Hidden</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      <Card title={isEditing ? 'Edit company' : 'Create company'} eyebrow="Details">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyles}>Name</label>
                <AdminInput {...form.register('name', { required: true })} placeholder="Company name" />
              </div>
            </div>
            <fieldset>
              <legend className={labelStyles}>Focus areas</legend>
              <div className="mt-2 grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
                {(['Robotics & Autonomy', 'Industrial Intelligence', 'Edge & Infrastructure', 'Physical AI'] as const).map((focusArea) => (
                  <label key={focusArea} className="flex items-center gap-3 text-sm text-muted">
                    <input
                      type="checkbox"
                      value={focusArea}
                      className="h-4 w-4 accent-primary"
                      {...form.register('focusAreas')}
                    />
                    {focusArea}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyles}>Stage</label>
                <AdminInput {...form.register('stage')} placeholder="Seed, Series A…" />
              </div>
              <div>
                <label className={labelStyles}>Status</label>
                <AdminSelect {...form.register('status')}>
                  <option value="active">Active</option>
                  <option value="exited">Exited</option>
                </AdminSelect>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyles}>First investment year</label>
                <AdminInput {...form.register('firstInvestmentYear')} type="number" placeholder="2018" />
              </div>
              <div>
                <label className={labelStyles}>CEO</label>
                <AdminInput {...form.register('ceo')} placeholder="Jane Founder" />
              </div>
            </div>
            <div>
              <label className={labelStyles}>Tagline</label>
              <AdminInput {...form.register('tagline')} placeholder="One crisp sentence" />
            </div>
            <div>
              <label className={labelStyles}>Description</label>
              <AdminTextarea rows={4} {...form.register('description')} placeholder="Short plaintext description" />
            </div>
          </section>
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelStyles}>Website</label>
                <AdminInput {...form.register('website')} placeholder="https://example.com" />
              </div>
              <div>
                <label className={labelStyles}>LinkedIn</label>
                <AdminInput {...form.register('linkedin')} placeholder="https://linkedin.com/company/example" />
              </div>
            </div>
            <div>
              <label className={labelStyles}>Founders (one per line)</label>
              <AdminTextarea rows={3} {...form.register('founders')} placeholder="Founder One&#10;Founder Two" />
            </div>
            <div>
              <label className={labelStyles}>Co-investors (one per line)</label>
              <AdminTextarea rows={3} {...form.register('coInvestors')} placeholder="Investor A&#10;Investor B" />
            </div>
            <div>
              <label className={labelStyles}>Office locations (one per line)</label>
              <AdminTextarea rows={3} {...form.register('officeLocations')} placeholder="San Francisco&#10;Berlin" />
            </div>
          </section>
          <section className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelStyles}>Links</label>
                <Button type="button" variant="ghost" onClick={() => form.setValue('links', [...linksData, { label: '', url: '' }])}>
                  + Add link
                </Button>
              </div>
              <div className="space-y-3">
                {linksFields.map((link, index) => (
                  <div key={`link-${index}`} className="rounded-2xl border border-white/10 p-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <AdminInput {...form.register(`links.${index}.label` as const)} placeholder="Label" defaultValue={link.label} />
                      <AdminInput {...form.register(`links.${index}.url` as const)} placeholder="https://…" defaultValue={link.url} />
                    </div>
                    {linksData.length > 1 && (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          className="text-xs text-muted underline"
                          onClick={() => form.setValue('links', linksData.filter((_, i) => i !== index))}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelStyles}>Facts</label>
                <Button type="button" variant="ghost" onClick={() => form.setValue('facts', [...factsData, { title: '', items: [{ text: '', url: '' }] }])}>
                  + Add fact
                </Button>
              </div>
              {factsFields.map((fact, factIndex) => {
                const factItems = (fact.items && fact.items.length > 0 ? fact.items : [{ text: '', url: '' }]) as FactItemInput[];
                return (
                  <div key={`fact-${factIndex}`} className="space-y-3 rounded-2xl border border-white/10 p-3">
                    <AdminInput {...form.register(`facts.${factIndex}.title` as const)} placeholder="Fact headline" defaultValue={fact.title} />
                    <div className="space-y-3">
                    {factItems.map((item, itemIndex) => (
                      <div key={`fact-${factIndex}-item-${itemIndex}`} className="grid gap-3 md:grid-cols-2">
                        <AdminInput
                          {...form.register(`facts.${factIndex}.items.${itemIndex}.text` as const)}
                          placeholder="Detail"
                          defaultValue={item.text}
                        />
                        <AdminInput
                          {...form.register(`facts.${factIndex}.items.${itemIndex}.url` as const)}
                          placeholder="Optional URL"
                          defaultValue={item.url}
                        />
                      </div>
                    ))}
                    <div className="text-right text-xs">
                      <button
                        type="button"
                        className="text-muted underline"
                        onClick={() => form.setValue(`facts.${factIndex}.items`, [...factItems, { text: '', url: '' }])}
                      >
                        + Add item
                      </button>
                    </div>
                  </div>
                  {factsData.length > 1 && (
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-xs text-muted underline"
                        onClick={() => form.setValue('facts', factsData.filter((_, i) => i !== factIndex))}
                      >
                        Remove fact
                      </button>
                    </div>
                  )}
                </div>
              );})}
            </div>
          </section>
          <section className="space-y-4">
            <div>
              <label className={labelStyles}>Logo URL</label>
              <AdminInput {...form.register('logo')} placeholder="/media/logo.png or https://…" />
            </div>
            <div>
              <label className={labelStyles}>Upload new logo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                {...form.register('logoFile')}
              />
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
          </section>
          {serverError && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">{serverError}</p>}
          {serverMessage && <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{serverMessage}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save company'}
            </Button>
            {isEditing && (
              <Button type="button" variant="ghost" onClick={handleDelete} disabled={isPending}>
                Delete company
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

function companyToFormValues(company: Company | null): CompanyFormValues {
  if (!company) {
    return {
      name: '',
      status: 'active',
      focusAreas: [],
      tagline: '',
      description: '',
      stage: '',
      firstInvestmentYear: '',
      founders: '',
      ceo: '',
      coInvestors: '',
      officeLocations: '',
      website: '',
      linkedin: '',
      links: [{ label: '', url: '' }],
      facts: [{ title: '', items: [{ text: '', url: '' }] }],
      logo: '',
      draft: false,
      hidden: false
    };
  }

  return {
    id: company.id,
    name: company.name,
    status: company.status,
    focusAreas: company.focusAreas,
    tagline: company.tagline ?? '',
    description: company.description ?? '',
    stage: company.stage ?? '',
    firstInvestmentYear: company.firstInvestmentYear ? String(company.firstInvestmentYear) : '',
    founders: company.founders.join('\n'),
    ceo: company.ceo ?? '',
    coInvestors: company.coInvestors.join('\n'),
    officeLocations: company.officeLocations.join('\n'),
    website: company.website ?? '',
    linkedin: company.linkedin ?? '',
    links: company.links.length > 0 ? company.links.map((link) => ({ ...link })) : [{ label: '', url: '' }],
    facts:
      company.facts.length > 0
        ? company.facts.map((fact) => ({
            title: fact.title,
            items: fact.items.map((item) => ({ text: item.text, url: item.url ?? '' }))
          }))
        : [{ title: '', items: [{ text: '', url: '' }] }],
    logo: company.logo ?? '',
    draft: Boolean(company.draft),
    hidden: Boolean((company as any).hidden)
  };
}

function buildCompanyPayload(values: CompanyFormValues): { payload: Company; file?: File } {
  const normalized = {
    id: values.id?.trim() || crypto.randomUUID(),
    name: values.name.trim(),
    slug: slugify(values.name.trim()),
    status: values.status,
    focusAreas: values.focusAreas ?? [],
    tagline: values.tagline?.trim() || undefined,
    description: values.description?.trim() || undefined,
    stage: values.stage?.trim() || undefined,
    firstInvestmentYear: values.firstInvestmentYear ? Number(values.firstInvestmentYear) : undefined,
    founders: toList(values.founders),
    ceo: values.ceo?.trim() || undefined,
    coInvestors: toList(values.coInvestors),
    officeLocations: toList(values.officeLocations),
    website: values.website?.trim() || undefined,
    linkedin: values.linkedin?.trim() || undefined,
    links: (values.links ?? [])
      .map((link) => ({
        label: link.label?.trim() || '',
        url: link.url?.trim() || ''
      }))
      .filter((link) => link.label && link.url),
    facts: (values.facts ?? [])
      .map((fact) => ({
        title: fact.title?.trim() || '',
        items: (fact.items ?? [])
          .map((item) => ({
            text: item.text?.trim() || '',
            url: item.url?.trim() || undefined
          }))
          .filter((item) => item.text)
      }))
      .filter((fact) => fact.title && fact.items.length > 0),
    logo: values.logo?.trim() || undefined,
    draft: Boolean(values.draft),
    hidden: Boolean(values.hidden)
  } as Company;

  const payload = companySchema.parse({
    ...normalized,
    coInvestors: normalized.coInvestors ?? [],
    officeLocations: normalized.officeLocations ?? [],
    founders: normalized.founders ?? [],
    links: normalized.links ?? [],
    facts: normalized.facts ?? []
  });

  const file = values.logoFile?.[0];
  return { payload, file };
}

function createCompanyFormData(payload: Company, file?: File): FormData {
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  if (file) {
    formData.append('logo', file);
  }
  return formData;
}

function toList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
