import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { marketingApi } from '@/lib/api';

/** Pages that always exist on the public site and don't come from
 *  the CMS. Listed by hand so the sitemap survives a backend outage. */
const STATIC_ROUTES: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFreq: 'weekly' },
  { path: '/pricing', priority: 0.9, changeFreq: 'monthly' },
  { path: '/blogs', priority: 0.7, changeFreq: 'weekly' },
  { path: '/about', priority: 0.6, changeFreq: 'monthly' },
  { path: '/contact', priority: 0.6, changeFreq: 'monthly' },
  { path: '/customers', priority: 0.5, changeFreq: 'monthly' },
  { path: '/changelog', priority: 0.5, changeFreq: 'weekly' },
  { path: '/integrations', priority: 0.5, changeFreq: 'monthly' },
  { path: '/legal', priority: 0.3, changeFreq: 'yearly' },
  { path: '/login', priority: 0.3, changeFreq: 'yearly' },
  { path: '/register', priority: 0.3, changeFreq: 'yearly' },
];

/**
 * Sitemap — combines the hand-curated static routes above with the
 * live blog posts so search engines find every published article. If
 * the backend is down we still ship the static list; blogs degrade
 * gracefully to "missing this revalidation cycle" rather than failing
 * the build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFreq,
    priority: r.priority,
  }));

  // Live blog posts. Wrapped in try/catch so a backend hiccup doesn't
  // 500 the sitemap.xml endpoint — search engines tolerate a thinner
  // sitemap better than a broken one.
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await marketingApi.listBlogPosts({ limit: 500 });
    blogEntries = (posts ?? []).map((p) => ({
      url: `${SITE_URL}/blogs/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Swallow — sitemap should still ship the static entries even if
    // the API is temporarily unreachable.
  }

  return [...staticEntries, ...blogEntries];
}
