import type { Metadata } from 'next';
import { cmsAuthedGet } from '@/lib/auth-server';
import { NavigationEditor } from '@/components/cms/nav/NavigationEditor';
import {
  EMPTY_SITE_NAV,
  SITE_NAV_SLUG,
  type SiteNavConfig,
} from '@/lib/site-nav';
import type { MarketingPage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Navigation · EduSphere CMS',
  robots: { index: false, follow: false },
};

interface AdminListResponse {
  data?: MarketingPage[];
}

/**
 * Loads the navigation override row (if any) and hands it to the
 * client-side editor. Uses the existing admin list endpoint to find
 * the row by slug since the backend has no "get by slug" admin path;
 * a fixed limit + slug match is enough for a single reserved entry.
 */
export default async function CmsNavigationPage() {
  const response = await cmsAuthedGet<AdminListResponse>(
    `/marketing/pages/admin/all?search=${encodeURIComponent(SITE_NAV_SLUG)}&limit=50`,
  );
  const row = response?.data?.find((p) => p.slug === SITE_NAV_SLUG) ?? null;

  // Defensive parse — fields validated independently so a half-edited
  // row in the DB doesn't blank the whole config in the editor.
  const initial: SiteNavConfig = (() => {
    if (!row?.content || typeof row.content !== 'object') return EMPTY_SITE_NAV;
    const c = row.content as Partial<SiteNavConfig>;
    const groupExtras: Record<string, SiteNavConfig['headerExtras']> = {};
    if (c.headerGroupExtras && typeof c.headerGroupExtras === 'object') {
      for (const [k, v] of Object.entries(
        c.headerGroupExtras as Record<string, unknown>,
      )) {
        if (Array.isArray(v)) groupExtras[k] = v as SiteNavConfig['headerExtras'];
      }
    }
    return {
      headerItems: Array.isArray(c.headerItems) ? c.headerItems : [],
      headerGroupExtras: groupExtras,
      headerGroups: Array.isArray(c.headerGroups) ? c.headerGroups : [],
      headerExtras: Array.isArray(c.headerExtras) ? c.headerExtras : [],
      footerColumns: Array.isArray(c.footerColumns) ? c.footerColumns : [],
      footerBottomLinks: Array.isArray(c.footerBottomLinks)
        ? c.footerBottomLinks
        : [],
    };
  })();

  return (
    <NavigationEditor
      pageId={row?.id ?? null}
      initial={initial}
      initialStatus={row?.status ?? null}
    />
  );
}
