import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { BlockRenderer } from '@/components/cms/render/BlockRenderer';
import { isBlocksContent, type BlocksContent } from '@/lib/blocks';
import type { MarketingPage } from '@/lib/types';

interface Params {
  slug: string;
}

// Don't pre-render — `?preview=<token>` and per-request status matter,
// so each hit goes through the dynamic path.
export const dynamic = 'force-dynamic';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

/**
 * Hit the backend preview endpoint with a short-lived signed token. The
 * endpoint verifies the JWT signature + audience + expiry, so anyone
 * with a token can render the matching draft — but only until the token
 * expires (30 min). No cookie / session needed, so the editor can hand
 * the URL out to non-CMS reviewers.
 */
async function fetchByPreviewToken(token: string): Promise<MarketingPage | null> {
  try {
    const res = await fetch(
      `${BASE}/marketing/pages/preview?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const envelope = await res.json();
    if (envelope && typeof envelope === 'object' && 'success' in envelope && 'data' in envelope) {
      return (envelope as { data: MarketingPage }).data ?? null;
    }
    return envelope as MarketingPage;
  } catch (err) {
    console.error('[preview] fetch failed', err);
    return null;
  }
}

/**
 * Resolve the page to render. Preview token wins (returns any status,
 * including drafts and scheduled); otherwise we fall back to the
 * published-only public endpoint.
 */
async function loadPage(slug: string, previewToken?: string): Promise<MarketingPage | null> {
  if (previewToken) {
    const draft = await fetchByPreviewToken(previewToken);
    // Only honour the token if the slug actually matches — otherwise a
    // token minted for page A could be reused to spy on page B.
    if (draft && draft.slug === slug) return draft;
  }
  return marketingApi.getPage(slug);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const page = await loadPage(slug, preview);
  if (!page) return { title: 'Page not found' };
  return buildPageMetadata({
    slug,
    title: page.seo?.metaTitle ?? page.title,
    description: page.seo?.metaDescription ?? '',
    path: `/p/${slug}`,
    // Always noindex the preview URL — even if SEO has noindex off — so
    // a leaked preview link can't accidentally enter Google's index.
    noindex: !!page.seo?.noindex || !!preview,
  });
}

export default async function CmsPublicPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const page = await loadPage(slug, preview);
  if (!page) notFound();

  if (!isBlocksContent(page.content)) {
    // Legacy slug-shaped page reached the generic renderer — surface a
    // helpful pointer rather than silently rendering nothing.
    return (
      <div className="py-20 text-center">
        <div className="max-w-[720px] mx-auto px-5">
          <h1 className="text-2xl font-extrabold text-slate-900">{page.title}</h1>
          <p className="text-slate-500 mt-3">
            This page hasn&apos;t been migrated to the block schema yet. Open it in
            the CMS to add blocks, or view its legacy public page at{' '}
            <a href={`/${slug}`} className="font-semibold" style={{ color: 'var(--color-brand)' }}>
              /{slug}
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const content = page.content as BlocksContent;

  return (
    <div>
      {preview && (
        <div className="bg-amber-100 text-amber-900 text-center text-sm py-2 font-medium">
          Previewing <strong>{page.status}</strong> · /{slug}. Visitors don&apos;t see this banner — the
          token expires in 30 minutes.
        </div>
      )}
      <BlockRenderer blocks={content.blocks} />
    </div>
  );
}
