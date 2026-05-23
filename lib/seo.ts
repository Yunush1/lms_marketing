import type { Metadata } from 'next';
import { marketingApi } from './api';
import type { MarketingPageSEO } from './types';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://edusphere.app';

const DEFAULTS = {
  siteName: 'EduSphere',
  titleSuffix: ' — EduSphere',
  description:
    'Academics, attendance, exams, fees and parent communication in one secure, multi-tenant platform.',
  keywords:
    'school management software, LMS, student information system, education platform',
  ogImage: '/og-default.png',
};

export interface PageSeoInput {
  /**
   * CMS slug — when provided, the published marketing_pages row overrides
   * any non-empty inline value below.
   */
  slug?: string;
  title: string;
  description?: string;
  keywords?: string;
  /** Path on this origin, e.g. "/pricing". Defaults to "/<slug>" if slug given. */
  path?: string;
  /** Absolute URL or root-relative path. Defaults to /og-default.png. */
  image?: string;
  bareTitle?: boolean;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const absoluteImage = (img: string) =>
  img.startsWith('http') ? img : `${SITE_URL}${img.startsWith('/') ? img : `/${img}`}`;

/**
 * Build a Next.js `Metadata` object, optionally merging in a CMS override
 * fetched server-side. Call from a `generateMetadata()` export:
 *
 *   export async function generateMetadata() {
 *     return buildPageMetadata({ slug: 'home', title: 'EduSphere', ... });
 *   }
 *
 * Returns the JSON-LD as part of the returned object's `other` field —
 * callers should also render `<JsonLd data={...} />` if they want it in the
 * <head>.
 */
export async function buildPageMetadata(input: PageSeoInput): Promise<Metadata> {
  let override: MarketingPageSEO | null = null;
  if (input.slug) {
    const row = await marketingApi.getPage(input.slug);
    override = row?.seo ?? null;
  }

  const resolvedTitle = override?.metaTitle?.trim() || input.title;
  const resolvedDescription = override?.metaDescription?.trim() || input.description || DEFAULTS.description;
  const resolvedKeywords = override?.keywords?.trim() || input.keywords || DEFAULTS.keywords;
  const resolvedImage = override?.ogImage?.trim() || input.image || DEFAULTS.ogImage;
  const resolvedNoindex = override?.noindex ?? input.noindex ?? false;
  const resolvedPath =
    override?.canonicalPath?.trim() ||
    input.path ||
    (input.slug ? `/${input.slug}` : '/');

  // Admin titles often include the suffix already; trust the admin verbatim.
  const useBare = input.bareTitle || !!override?.metaTitle?.trim();
  const fullTitle = useBare ? resolvedTitle : `${resolvedTitle}${DEFAULTS.titleSuffix}`;

  const canonicalUrl = `${SITE_URL}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`;
  const ogImageUrl = absoluteImage(resolvedImage);

  return {
    title: fullTitle,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    alternates: { canonical: canonicalUrl },
    robots: resolvedNoindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      siteName: DEFAULTS.siteName,
      title: fullTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: resolvedDescription,
      images: [ogImageUrl],
    },
  };
}

// JsonLd lives in components/JsonLd.tsx — re-exported for convenience.
export { JsonLd } from '@/components/JsonLd';
