/**
 * Axios-based API client for the NestJS marketing backend.
 *
 * The marketing site uses this in two ways:
 *  - Server components / generateMetadata call the bare functions directly
 *    (`marketingApi.getHome()`). These run during build / ISR revalidation;
 *    a failed call returns null so the page falls back to bundled seed copy.
 *  - Client components (Contact form, newsletter, etc.) use the same
 *    instance via React Query hooks for mutations.
 *
 * `next` ISR options are passed through to `fetch` adapter so static
 * regeneration respects the same 10-minute window the backend's own Redis
 * cache uses.
 */
import axios, { type AxiosInstance } from 'axios';
import type {
  Blog,
  ChangelogEntry,
  CustomerContent,
  HomeContent,
  IntegrationContent,
  LeadPayload,
  LeadResponse,
  MarketingPage,
  MarketingPricing,
  SolutionContent,
} from './types';

export const BASE = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_API_URL_PUBLIC ?? process.env.NEXT_PUBLIC_API_URL
  : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
// For simplicity, we assume the public URL (used in production) has the same path structure as the internal one — if that's not the case, set NEXT_PUBLIC_API_URL_PUBLIC explicitly to the full public API root URL including any path prefix.


// Match the backend's Redis TTL so we don't out-cache its own freshness window.
const DEFAULT_REVALIDATE_SECONDS = 600;

export const http: AxiosInstance = axios.create({
  baseURL: BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

interface ServerGetOptions {
  revalidate?: number;
}

/**
 * Server-only GET that uses the native fetch (so Next.js's ISR + revalidate
 * controls apply). Returns null on any failure so callers can fall back to
 * inline copy instead of crashing the prerender.
 *
 * The backend wraps every response via TransformInterceptor:
 *   { success, statusCode, message, data, pagination?, timestamp }
 * We unwrap to `data` here so callers always get the raw payload they
 * expect — same shape they'd see if they hit the backend directly.
 */
async function serverGet<T>(path: string, opts: ServerGetOptions = {}): Promise<T | null> {
  const { revalidate = DEFAULT_REVALIDATE_SECONDS } = opts;
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    const envelope = await res.json();
    // Unwrap if it's the standard envelope; otherwise return as-is (works
    // for legacy / un-intercepted endpoints).
    if (envelope && typeof envelope === 'object' && 'data' in envelope && 'success' in envelope) {
      return (envelope as { data: T }).data ?? null;
    }
    return envelope as T;
  } catch (err) {
    console.error('[marketing] api fetch failed', url, err);
    return null;
  }
}

// ── Server-side reads (used by server components + generateMetadata) ──

/** Coerce non-array responses to null so list callers safely fall back. */
async function serverGetArray<T>(path: string): Promise<T[] | null> {
  const res = await serverGet<T[]>(path);
  return Array.isArray(res) ? res : null;
}

export const marketingApi = {
  getHome: () => serverGet<HomeContent>('/marketing/home'),
  getPricing: () => serverGet<MarketingPricing>('/marketing/pricing'),
  listSolutions: () => serverGetArray<SolutionContent>('/marketing/solutions'),
  getSolution: (slug: string) => serverGet<SolutionContent>(`/marketing/solutions/${slug}`),
  listProducts: () => serverGetArray<SolutionContent>('/marketing/products'),
  getProduct: (slug: string) => serverGet<SolutionContent>(`/marketing/products/${slug}`),
  listIntegrations: () => serverGetArray<IntegrationContent>('/marketing/integrations'),
  listCustomers: () => serverGetArray<CustomerContent>('/marketing/customers'),
  listChangelog: () => serverGetArray<ChangelogEntry>('/marketing/changelog'),

  // CMS per-page override row (SEO + structured content + bodyHtml)
  getPage: (slug: string) =>
    serverGet<MarketingPage>(`/marketing/pages/public/${encodeURIComponent(slug)}`),

  // Blog
  listBlogPosts: async (params?: { tag?: string; limit?: number }): Promise<Blog[]> => {
    const qs = new URLSearchParams();
    qs.set('limit', String(params?.limit ?? 50));
    if (params?.tag) qs.set('tag', params.tag);
    const res = await serverGet<{ data: Blog[] }>(`/blogs?${qs.toString()}`);
    return Array.isArray(res) ? (res as Blog[]) : [];
  },
  getBlogPost: (slug: string) => serverGet<Blog>(`/blogs/${slug}`),
};

// ── Blog post normalizer (matches the SPA's toBlogPost) ────────────────

const GRADIENTS = [
  'linear-gradient(135deg,#4f46e5,#06b6d4)',
  'linear-gradient(135deg,#7c3aed,#ec4899)',
  'linear-gradient(135deg,#0ea5e9,#22c55e)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
];

const gradientFor = (key: string) => {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
};

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export interface BlogPostView {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  date: string;
  tag: string;
  readMins: number;
  cover: string;
  image?: string | null;
  metaData?: Record<string, unknown> | null;
}

export function toBlogPost(b: Blog): BlogPostView {
  const text = stripHtml(b.content || '');
  const words = text ? text.split(' ').length : 0;
  const metadata = b.metadata as Record<string, unknown> | null | undefined;
  const tags = metadata?.tags as string[] | undefined;
  const excerptOverride = metadata?.excerpt as string | undefined;
  return {
    slug: b.slug,
    title: b.title,
    excerpt:
      excerptOverride?.trim() || `${text.slice(0, 160)}${text.length > 160 ? '…' : ''}`,
    body: b.content || '',
    author: 'EduSphere Team',
    date: b.publishedAt || b.createdAt,
    tag: tags?.[0] || 'Insights',
    readMins: Math.max(1, Math.ceil(words / 200)),
    cover: b.image || gradientFor(b.slug),
    image: b.image,
    metaData: (metadata as Record<string, unknown>) || null,
  };
}

// ── Client-side mutations (used by React Query hooks) ──

export const leadsApi = {
  submit: (payload: LeadPayload) =>
    http.post<LeadResponse>('/leads', payload).then((r) => r.data),
};

export const docFeedbackApi = {
  /**
   * Optional analytics endpoint — silently fails if unimplemented on the backend.
   * Used by the Docs page to capture thumbs-up/thumbs-down per question.
   */
  record: async (slug: string, question: string, helpful: boolean) => {
    try {
      await http.post('/audit/doc-feedback', { slug, question, helpful });
    } catch {
      /* analytics is best-effort */
    }
  },
};
