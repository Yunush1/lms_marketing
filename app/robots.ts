import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Crawl directives. We let everything public be indexed and point
 * crawlers at the sitemap so they pick up product, blog, and solution
 * pages without us listing each by hand.
 *
 * Routes that must stay out of the public index (CMS preview, admin
 * dashboards on the SPA) live on different subdomains, so a single
 * disallow line here isn't necessary — but we still exclude any
 * `cms/*` paths in case a future preview link leaks.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cms/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
