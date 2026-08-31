import { z } from 'zod';

const nullableString = () => z.string().optional().nullable();
const nullableUrl = () => z.string().url().optional().nullable();
const nullableLink = () => z.union([z.string().url(), z.literal('#')]).optional().nullable();

const linkSchema = z.object({
  label: z.string(),
  url: z.string().url()
});

const factItemSchema = z.object({
  text: z.string(),
  url: z.string().url().optional()
});

const factSchema = z.object({
  title: z.string(),
  items: z.array(factItemSchema)
});

const statSchema = z.object({
  label: z.string(),
  value: z.string()
});

export const companyFocusAreaSchema = z.enum([
  'Robotics & Autonomy',
  'Industrial Intelligence',
  'Edge & Infrastructure',
  'Physical AI'
]);

export const companySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  status: z.enum(['active', 'exited']),
  focusAreas: z.array(companyFocusAreaSchema).optional().default([]),
  tagline: nullableString(),
  descriptionHtml: nullableString(),
  description: nullableString(),
  stage: nullableString(),
  firstInvestmentYear: z.number().int().optional().nullable(),
  founders: z.array(z.string()),
  ceo: nullableString(),
  coInvestors: z.array(z.string()),
  officeLocations: z.array(z.string()),
  website: nullableUrl(),
  linkedin: nullableUrl(),
  links: z.array(linkSchema),
  facts: z.array(factSchema),
  logo: nullableString(),
  draft: z.boolean().optional(),
  hidden: z.boolean().optional()
});

export const teamMemberSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  bio: nullableString(),
  bioHtml: nullableString(),
  headshotUrl: nullableString(),
  heroImageUrl: nullableString(),
  stats: z.array(statSchema),
  socialLinks: z.array(linkSchema),
  featureLinks: z.array(linkSchema),
  companySlugs: z.array(z.string()),
  newsSlugs: z.array(z.string()),
  order: z.number().int().optional(),
  draft: z.boolean().optional(),
  hidden: z.boolean().optional()
});

export const newsItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  companyId: nullableString(),
  teamMemberIds: z.array(z.string()).optional().default([]),
  title: z.string(),
  summary: nullableString(),
  bodyHtml: nullableString(),
  link: nullableLink(),
  publishedAt: z.string(),
  featured: z.boolean().optional(),
  imageUrl: nullableString(),
  logoPreference: nullableString(),
  draft: z.boolean().optional(),
  hidden: z.boolean().optional()
});

export const companiesSchema = z.array(companySchema);
export const teamMembersSchema = z.array(teamMemberSchema);
export const newsItemsSchema = z.array(newsItemSchema);

export const contentBundleSchema = z.object({
  companies: companiesSchema,
  team: teamMembersSchema,
  news: newsItemsSchema
});
