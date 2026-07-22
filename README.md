# FerSil VC Website

This project powers the next iteration of `fersil.vc` using Next.js 14, JSON content, custom admin tooling, and a private-launch developer access flow.

## Development

- Install dependencies: `npm install`
- Run the dev server: `npm run dev`
- Run lint/type-check: `npm run lint && npm run type-check`

### Required environment

Set `NEXT_PUBLIC_SITE_URL` (or `SITE_URL`) to the canonical domain for the deployment. Helpers such as `absoluteUrl` and Open Graph metadata depend on this value. Example:

```
NEXT_PUBLIC_SITE_URL=https://fersil.vc
```

During local development, the helper falls back to `http://localhost:3000`.

### Private launch / developer access

When `SITE_COMING_SOON=1`, the public site redirects to `/coming-soon`.

Developer access behavior:

- Only `@fersil.vc` addresses are accepted
- The user requests a six-digit code by e-mail
- The code is delivered through your `admin@fersil.vc` mailbox using Gmail SMTP with OAuth2
- Successful verification stores a browser cookie and unlocks the site until that cookie expires

Required variables for that flow:

```bash
SITE_COMING_SOON=1
DEVELOPER_ACCESS_SECRET=replace-with-a-long-random-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=1
SMTP_USER=admin@fersil.vc
SMTP_FROM_EMAIL="FerSil VC <admin@fersil.vc>"
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_REFRESH_TOKEN=your-google-refresh-token
NEXT_PUBLIC_SITE_URL=https://fersil.vc
```

Optional fallback if you intentionally use SMTP password auth instead of OAuth:

```bash
SMTP_PASS=replace-with-google-app-password
```

Use `.env.example` as the starting point for `.env.local`.

### Cloudflare storage model

This branch is prepared for Cloudflare Workers with OpenNext:

- `content/*.json` and `content/admin.json` can be read from the repo locally and from a private R2 bucket in deployed runtime
- existing historical assets under `public/media/uploads/` stay as checked-in static files
- new uploads created through the admin console are stored in the media R2 bucket and served back through `/api/media/[...key]`

Default R2 bindings expected by the code:

```bash
FERSIL_CONTENT
FERSIL_MEDIA
```

If you prefer different binding names, set these environment variables:

```bash
CLOUDFLARE_CONTENT_BUCKET_BINDING=your-content-binding
CLOUDFLARE_MEDIA_BUCKET_BINDING=your-media-binding
```

## Project Structure

- `app/` — App Router pages (public site + admin)
- `components/` — Reusable UI + layout primitives
- `content/` — JSON data sources for companies, team, news
- `lib/` — Shared utilities (content loaders, formatting helpers)
- `schemas/` — Zod schemas for content validation
- `scripts/` — Import/maintenance tools

Refer to `.zenflow/tasks/new-fersil-website-b8bd/spec.md` for the full specification and roadmap.

---

## Local Run (macOS)

Prerequisites
- Node 20+ (project supports >=18.17)
- npm 10+

Steps
1) Install deps: `npm install`
2) Create `.env.local` from `.env.example`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_COMING_SOON=1
DEVELOPER_ACCESS_SECRET=replace-with-a-long-random-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=1
SMTP_USER=admin@fersil.vc
SMTP_FROM_EMAIL="FerSil VC <admin@fersil.vc>"
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
GOOGLE_OAUTH_REFRESH_TOKEN=your-google-refresh-token

# Local-only admin convenience
ADMIN_OPEN_ACCESS=1
```
3) Start dev server: `npm run dev`
4) Open: http://localhost:3000

Useful scripts
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Build: `npm run build`
- Start (after build): `npm run start`

## Cloudflare Run

Prerequisites
- Cloudflare account with Workers enabled
- Two R2 buckets:
  - `fersil-vc-content`
  - `fersil-vc-media`
- Wrangler authenticated with your Cloudflare account

Key files
- `wrangler.jsonc`
- `open-next.config.ts`
- `.dev.vars.example`

Commands
- Local Next dev: `npm run dev`
- Cloudflare build: `npm run build`
- Local Worker preview: `npm run preview`
- Deploy: `npm run deploy`

Notes
- The Cloudflare build currently uses OpenNext’s unsupported-version override because this site is still on `Next.js 14.2.35`. As of July 22, 2026, Next 14 is outside the supported window, so upgrading this app to Next 15 or 16 is still recommended.
- During local and CI builds, content falls back to the checked-in JSON files if the R2 content bucket is empty. In production, populate the bucket with `companies.json`, `team.json`, `news.json`, and `admin.json` if you want remote persistence from the start.
