# EduSphere — Marketing Site

A pre-rendered Next.js 15 site for the public marketing pages (Home,
Pricing, About, etc.). It shares the same NestJS backend as the
authenticated React SPA, but lives in its own deployable so marketing
visitors get instant static HTML instead of an SPA shell.

## Why this exists

The original React SPA shipped ~1.3 MB gzipped of JS before painting
anything — leading to 50-100s FCP/LCP on Slow 4G. This site:

- **Pre-renders every page** at build time (or on first request, then caches)
- **Hydrates only the parts that need JS** (the mobile menu, basically)
- **No antd, no icon library** — Tailwind + inline SVGs only
- **Fetches CMS content from the existing backend** via ISR (Incremental Static
  Regeneration), so SEO/marketing team edits in `/dashboard/marketing-pages`
  on the admin app go live within 10 minutes without redeploying.

## Architecture

```
edusphere.app          ← this Next.js site (marketing)
app.edusphere.app      ← the existing React SPA (authenticated app)
api.edusphere.app      ← the existing NestJS backend (shared)
```

The "Sign in" / "Start free" buttons in the header/footer link to
`NEXT_PUBLIC_APP_URL` (the SPA subdomain). The SPA still handles login,
dashboard, admin CMS, etc.

## Local development

Prereqs: Node 20+, the NestJS backend running locally on `:3000`.

```bash
cd marketing
npm install
cp .env.example .env.local
# edit .env.local to point at your backend
npm run dev
# Open http://localhost:3001
```

Next.js will pick the next available port (3001) since the backend uses 3000.

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `API_URL` | Yes | Backend root with `/api/v1` prefix. Used by server-side fetches. |
| `NEXT_PUBLIC_SITE_URL` | Yes (in prod) | Canonical site origin, used for `<link rel=canonical>` and OG URLs. |
| `NEXT_PUBLIC_APP_URL` | Yes (in prod) | Authenticated app's URL (e.g. `https://app.edusphere.app`). Header CTAs link here. |

## How data flows

1. A visitor hits `https://edusphere.app/`.
2. Next.js serves the **pre-built HTML** (generated at deploy + refreshed via
   ISR every 10 min). FCP/LCP are essentially server response time.
3. Each page component is an **async server component** that calls
   `marketingApi.getHome()` etc. during the build / revalidation. Those calls
   hit the backend's `/marketing/*` endpoints (which already prefer DB
   `marketing_pages` rows over the seed).
4. SEO is built via `generateMetadata()` calling `buildPageMetadata({ slug, ... })`.
   The helper fetches the `marketing_pages` CMS row for that slug, merging
   overrides over inline defaults. Same SEO behaviour as the SPA's
   `<PageSEO slug>` component, but rendered into the HTML head at build time.

## Pages

| Route | File | Source |
|---|---|---|
| `/` | [app/page.tsx](app/page.tsx) | `/marketing/home` + `/marketing/pricing` + `/marketing/pages/public/home` |
| `/pricing` | [app/pricing/page.tsx](app/pricing/page.tsx) | `/marketing/pricing` + `/marketing/pages/public/pricing` |
| `/about` | [app/about/page.tsx](app/about/page.tsx) | static + `/marketing/pages/public/about` (SEO only) |

### Pages not yet built — stubs to add

- `/blogs` (list) + `/blogs/[slug]` (post)
- `/docs`
- `/contact`
- `/security`
- `/customers`
- `/integrations`
- `/changelog`
- `/legal/[slug]`
- `/solutions/[slug]`
- `/product/[slug]`

Each one is a small file following the same pattern as Pricing/About:

```ts
export const revalidate = 600;

export async function generateMetadata() {
  return buildPageMetadata({ slug: 'customers', title: 'Customers', path: '/customers' });
}

export default async function CustomersPage() {
  const data = await marketingApi.getCustomers(); // add to lib/api.ts
  return <div>...</div>;
}
```

For dynamic slugs (`legal/[slug]`, `blogs/[slug]`, etc.) use
`generateStaticParams()` to pre-build the known list at build time, and
let unknown slugs render via SSR on demand.

## Build & deploy

```bash
npm run build    # outputs .next/
npm run start    # runs the Node server
```

Deploy targets that work out of the box:
- **Vercel** — zero config; ISR + image optimisation just work
- **Self-hosted Node** — `npm run start` behind a reverse proxy
- **Docker** — use the official `node:20-alpine` image, copy `.next/` and `package.json`

### Production checklist

- [ ] `API_URL` points at production backend (e.g. `https://api.edusphere.app/api/v1`)
- [ ] `NEXT_PUBLIC_SITE_URL` is the canonical origin (`https://edusphere.app`)
- [ ] `NEXT_PUBLIC_APP_URL` points at the SPA subdomain (`https://app.edusphere.app`)
- [ ] CORS on the backend allows server-to-server calls from this app's deploy host
- [ ] DNS: `edusphere.app` → this site, `app.edusphere.app` → SPA
- [ ] OG image exists at `/og-default.png` (1200×630)

## Relationship to `frontend/`

The original SPA at `../frontend/` continues to host:
- All authenticated routes (`/dashboard/*`, `/students`, admin CMS, etc.)
- `/login`, `/register`, `/reset-password`, magic-link
- The blog post viewer if you choose to keep it there

**Public marketing routes in the SPA can be deleted once this site is live**
(or kept temporarily as a redirect target). The SPA's `App.tsx` would also
no longer need to lazy-load any public pages — only the auth + dashboard
shell.
