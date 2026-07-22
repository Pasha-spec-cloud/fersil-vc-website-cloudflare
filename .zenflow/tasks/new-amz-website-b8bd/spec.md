# Technical Specification — New AMZ Website

## Technical Context
- **Stack**: Next.js 14 (App Router, React Server Components) with TypeScript for type safety and incremental adoption of server actions. Node.js 18+ runtime assumed.
- **Styling**: Tailwind CSS + CSS variables for color/typography tokens, plus Framer Motion for subtle hero/section transitions. Global fonts pulled through `next/font`.
- **Content storage**: Git-tracked JSON files under `content/` (companies, team, news) parsed through Zod schemas to guarantee shape consistency and prevent malformed data at build/runtime.
- **CMS tooling**: Lightweight password-protected admin interface implemented inside the same Next.js app. Admin pages talk to file-backed APIs that read/write the JSON files using `fs/promises`. For production this requires a Node environment with persistent storage (self-hosted server or container); otherwise integration with an object store (S3) must be configured.
- **Testing utilities**: ESLint + TypeScript checks, component tests with Vitest/React Testing Library, and smoke-level Playwright tests for editing flows.

## Implementation Approach
1. **Project bootstrap & theming**
   - Initialize Next.js with the App Router, SWC, Tailwind, ESLint, Jest/Vitest, and Playwright. Configure path aliases via `tsconfig.json`. Add base layout with metadata, structured data tags, and responsive grid utilities.
   - Define a brand system inspired by almazcapital.com but distinct: darker hero, glassmorphic cards, gradient accent lines. Store tokens inside `styles/theme.ts` and Tailwind config for easy future tweaks.

2. **Data layer & contracts**
   - Create `content/companies.json`, `content/team.json`, `content/news.json` pre-populated with all current almazcapital.com entries (fields described below). Provide `schema/*.ts` with Zod validators and shared TypeScript types under `types/content.ts`.
   - Build `lib/content.ts` helpers for loading/saving JSON, sorting by priority/date, and deriving computed props (e.g., grouping companies by sector/stage).

3. **Public website**
   - Homepage (`app/page.tsx`) composed of hero, thesis/strategy block, stats, team carousel, featured companies grid, success stories, news timeline, CTA/footer. Each section lives inside `components/sections/*` for reuse.
   - Companies index page with filters (stage, geography, sector) and detail pages at `/companies/[slug]` showing overview, metrics, related news, and external links.
   - Team page rendering leadership grid with role filters and biography modals; News page with year-based grouping and detail drawers.
   - Ensure shared primitives (SectionShell, Card, Avatar, Carousel, Tabs, Timeline) live under `components/ui/`.
   - Add SEO metadata (OpenGraph, JSON-LD for organization + articles) and responsive OG images via the Next.js OG Image route.

4. **Admin editing tools**
   - Implement `/admin/login` (simple email/password stored as env vars) and `/admin` dashboard pages under a separate App Router segment guarded by middleware.
   - Admin dashboard displays tables for Companies, News, Team with search/sort. Implement create/edit forms with validation using React Hook Form + Zod. File uploads (logos, portraits) stored under `/public/media/`.
   - Implement server actions + API routes under `app/api/admin/[resource]/route.ts` supporting GET/POST/PATCH/DELETE. Handlers call shared file helpers to mutate the JSON files atomically (read, update in memory, write back) and return updated payloads.
   - Add optimistic UI updates and toast notifications. Provide "draft" flag per entity to allow preparing content before publishing.

5. **Content import scripts**
   - Provide a one-off script `scripts/import-almaz-data.ts` that ingests CSV/JSON scraped from the legacy site and outputs normalized JSON matching schemas. Include instructions inside README for running the import (requires manual data entry if scraping isn't available).

6. **Deployment hooks**
   - Configure environment variables for admin auth, analytics (e.g., Plausible), and CMS file paths.
   - Document hosting requirement: deploy on a Node server (e.g., Render, DigitalOcean) to allow file writes, or swap file storage helper to target S3-compatible bucket. Provide interface so swapping happens by changing `CONTENT_STORAGE_DRIVER` env.

## Source Code Structure Changes
```
/ (repo root)
├── .gitignore (already created, ensure Next outputs tracked)
├── package.json / tsconfig.json / next.config.mjs
├── app/
│   ├── layout.tsx / globals.css
│   ├── page.tsx (homepage)
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── team/page.tsx
│   ├── news/page.tsx
│   ├── admin/(auth)/login/page.tsx
│   ├── admin/(dashboard)/page.tsx
│   ├── admin/companies/[id]/page.tsx (edit)
│   ├── api/content/[resource]/route.ts
│   └── api/admin/[resource]/route.ts
├── components/
│   ├── sections/
│   └── ui/
├── content/
│   ├── companies.json
│   ├── team.json
│   └── news.json
├── lib/
│   ├── content.ts (loader + writer)
│   ├── cache.ts (simple in-memory cache w/ revalidation)
│   ├── auth.ts (admin auth helpers)
│   └── seo.ts
├── schemas/
│   └── content.ts (Zod contracts)
├── scripts/
│   └── import-almaz-data.ts
├── tests/
│   ├── components/*.test.tsx
│   └── e2e/admin.spec.ts
└── public/
    ├── media/
    └── og-image.tsx
```

## Data Model / API Contracts
- **Company**: `{ id: string; slug: string; name: string; logo: string; sector: Sector; stage: 'Seed' | 'Series A' | 'Growth' | 'Exited'; geography: string; founded: number; description: string; thesis: string; highlights: string[]; website: string; status: 'active' | 'exited'; featured?: boolean; draft?: boolean; }`
- **TeamMember**: `{ id: string; name: string; role: string; bio: string; headshot: string; focus: string[]; location: string; linkedin?: string; email?: string; order: number; draft?: boolean; }`
- **NewsItem**: `{ id: string; title: string; summary: string; body: string; link?: string; publishedAt: string; tags: string[]; relatedCompanyIds: string[]; featured?: boolean; draft?: boolean; }`

Validation handled via Zod schemas used in both server actions and admin forms. All APIs return `{ data, error? }` envelopes and enforce authentication for mutations.

- `GET /api/content/{companies|team|news}` → public read, cached via Next revalidation.
- `POST /api/admin/{resource}` → create entity (requires `Authorization: Bearer <token>`).
- `PATCH /api/admin/{resource}/{id}` and `DELETE ...` follow the same pattern. File helper ensures writes are atomic and revalidate the corresponding path via `revalidatePath('/companies')`, etc.

## Verification Approach
1. **Static analysis**: `npm run lint` (ESLint) and `npm run type-check` (tsc --noEmit) ensure type + lint health.
2. **Unit/component tests**: `npm run test` (Vitest) covering content helpers, filtering logic, and rendering of core components.
3. **E2E**: `npm run test:e2e` (Playwright) verifying admin auth, create/edit/delete company, and that public sections reflect changes.
4. **Manual QA**: Responsive review at breakpoints (360px, 768px, 1440px); verify metadata/OG tags via browser devtools; confirm JSON files update after admin actions; confirm fallback when no news/team entries exist.
5. **Performance**: Run `npm run build && npm run start` locally and Lighthouse audit to ensure 90+ scores for perf/accessibility/SEO.

## Risks & Open Questions
- Need confirmation on hosting environment to ensure server-side file persistence is acceptable. If deploying to Vercel (ephemeral FS), we must integrate an external storage driver (S3, Supabase) early.
- Brand assets (logo variations, imagery) and copy guidelines from the AMZ team are required to finalize design tokens.
- Importing current company/team/news data requires either manual entry or a provided export from almazcapital.com; scraping without an official export may be time-consuming.
- Admin auth scheme (single shared password vs. multi-user) and desired audit logging need clarification.
- Accessibility/translation requirements (e.g., Russian localization) are unspecified—confirm before design lock.
