/**
 * Site-wide navigation config — stored in the existing `marketing_pages`
 * table under the reserved slug below, edited from /cms/navigation, and
 * read by the public Header + Footer to inject the marketing team's
 * own links (incl. their CMS-authored /p/<slug> pages) into the site
 * chrome.
 *
 * The schema is deliberately shallow:
 *  - `headerExtras`: appended to the bundled header nav as flat leaves.
 *    The existing dropdown groups (Product / Solutions / Resources)
 *    stay hardcoded so they don't accidentally vanish if an editor
 *    nukes the config.
 *  - `footerColumns`: appended to the bundled footer columns as
 *    additional columns. Heading + flat list of items.
 *  - `footerBottomLinks`: appended to the bottom row next to Terms /
 *    Privacy / DPA / Cookies.
 *
 * Adding a new structured-content surface (e.g. a mega-menu) means
 * extending this interface — the editor + render code keys off the
 * field names.
 */
import { marketingApi } from './api';

/** Slug the editor writes to + Header/Footer read from. Path-style so
 *  it can't collide with an editor-created page like "site-nav". */
export const SITE_NAV_SLUG = 'site/nav';

export interface SiteNavLink {
  label: string;
  /** Marketing-site path (`/about`), CMS page path (`/p/black-friday`),
   *  or full URL (`https://status.edusphere.app`). */
  target: string;
}

export interface SiteNavColumn {
  heading: string;
  items: SiteNavLink[];
}

/**
 * A single top-level entry in the header — either a flat link or a
 * dropdown group. Discriminated union so the editor + renderer can
 * switch on `kind` without checking property presence.
 */
export type HeaderItem =
  | { kind: 'link'; label: string; target: string }
  | { kind: 'group'; label: string; items: SiteNavLink[] };

/**
 * The bundled header structure shipped in code. Used by:
 *   - `Header.tsx` as the fallback when the CMS hasn't customised the nav.
 *   - The "Sync current navbar" button in /cms/navigation, which copies
 *     this list into the CMS row so editors can edit / reorder / remove
 *     items without recreating the existing structure by hand.
 *
 * Keep this list canonical — if you add a new top-level public route,
 * add it here so every code path that derives the nav starts referencing
 * it.
 */
export const BUNDLED_HEADER_NAV: HeaderItem[] = [
  {
    kind: 'group',
    label: 'Product',
    items: [
      { label: 'Academics', target: '/product/academics' },
      { label: 'Fees & Billing', target: '/product/fees-billing' },
      { label: 'Staff & Payroll', target: '/product/staff-payroll' },
      { label: 'Parent Engagement', target: '/product/parents' },
      { label: 'Reports & Insights', target: '/product/reports' },
    ],
  },
  {
    kind: 'group',
    label: 'Solutions',
    items: [
      { label: 'Single school', target: '/solutions/schools' },
      { label: 'Multi-campus groups', target: '/solutions/groups' },
      { label: 'Coaching & tutoring', target: '/solutions/coaching' },
    ],
  },
  { kind: 'link', label: 'Pricing', target: '/pricing' },
  { kind: 'link', label: 'Customers', target: '/customers' },
  {
    kind: 'group',
    label: 'Resources',
    items: [
      { label: 'Blog', target: '/blogs' },
      { label: 'Docs', target: '/docs' },
      { label: 'Changelog', target: '/changelog' },
      { label: 'Integrations', target: '/integrations' },
    ],
  },
  {
    kind: 'group',
    label: 'Company',
    items: [
      { label: 'About', target: '/about' },
      { label: 'Security & trust', target: '/security' },
      { label: 'Contact', target: '/contact' },
    ],
  },
];

/**
 * Take the bundled nav and fold any legacy "extras" the editor was
 * already saving into the matching slot. Used when an editor clicks
 * Sync the first time — their previous extras come along so they don't
 * have to redo them.
 */
export function syncBundledNav(extras: {
  headerGroupExtras?: Record<string, SiteNavLink[]>;
  headerGroups?: SiteNavColumn[];
  headerExtras?: SiteNavLink[];
}): HeaderItem[] {
  const next: HeaderItem[] = BUNDLED_HEADER_NAV.map((it) => {
    if (it.kind === 'link') return { ...it };
    const moreItems = extras.headerGroupExtras?.[it.label] ?? [];
    return { kind: 'group', label: it.label, items: [...it.items, ...moreItems] };
  });
  for (const g of extras.headerGroups ?? []) {
    if (!g.heading.trim()) continue;
    next.push({ kind: 'group', label: g.heading, items: g.items });
  }
  for (const e of extras.headerExtras ?? []) {
    if (!e.label.trim()) continue;
    next.push({ kind: 'link', label: e.label, target: e.target });
  }
  return next;
}

export interface SiteNavConfig {
  /**
   * The fully editable header structure once the editor has clicked
   * "Sync current navbar". When this list is non-empty it REPLACES the
   * bundled `BUNDLED_HEADER_NAV` on the public site — the editor has
   * taken full control of the navbar and doesn't depend on bundled
   * defaults any more.
   *
   * When empty, the bundled nav is used (optionally with the legacy
   * `headerGroupExtras` / `headerGroups` / `headerExtras` layered on
   * for back-compat with the previous "append-only" editor mode).
   */
  headerItems: HeaderItem[];
  /**
   * Legacy: items injected INTO a built-in dropdown (Product /
   * Solutions / Resources). Only consulted when `headerItems` is empty.
   * Kept on the schema so previously-saved configs keep rendering.
   */
  headerGroupExtras: Record<string, SiteNavLink[]>;
  /** Legacy: brand-new dropdowns. Only used when `headerItems` is empty. */
  headerGroups: SiteNavColumn[];
  /** Legacy: flat top-level extras. Only used when `headerItems` is empty. */
  headerExtras: SiteNavLink[];
  footerColumns: SiteNavColumn[];
  footerBottomLinks: SiteNavLink[];
}

/**
 * Labels of the built-in header dropdowns — must match the labels in
 * `components/Header.tsx`. Exposed so the editor knows which slots to
 * offer "add into existing dropdown" UI for. Keep in sync if a group is
 * renamed in Header.tsx.
 */
export const HEADER_BUILTIN_GROUPS = ['Product', 'Solutions', 'Resources'] as const;
export type HeaderBuiltinGroup = (typeof HEADER_BUILTIN_GROUPS)[number];

/** Empty config — used when no CMS row exists yet. Keeps the bundled
 *  defaults in Header/Footer fully intact. */
export const EMPTY_SITE_NAV: SiteNavConfig = {
  headerItems: [],
  headerGroupExtras: {},
  headerGroups: [],
  headerExtras: [],
  footerColumns: [],
  footerBottomLinks: [],
};

/**
 * Fetch the site-nav config from the CMS. Returns the empty config
 * when:
 *   - The marketing_pages row is missing
 *   - The row is unpublished (Header/Footer should never render a
 *     draft nav to anonymous visitors)
 *   - The row's `content` doesn't look like a SiteNavConfig
 *
 * Cached via the fetch adapter for 10 min (matches the marketing
 * site's other ISR windows), so Header/Footer don't make a backend
 * call on every public request.
 */
export async function getSiteNav(): Promise<SiteNavConfig> {
  const row = await marketingApi.getPage(SITE_NAV_SLUG);
  if (!row?.content || typeof row.content !== 'object') return EMPTY_SITE_NAV;
  const c = row.content as Partial<SiteNavConfig>;
  // Each field validated independently so a malformed half-edited row
  // can't blank the whole nav — the fields it *did* persist still come
  // through.
  return {
    headerItems: Array.isArray(c.headerItems) ? sanitizeHeaderItems(c.headerItems) : [],
    headerGroupExtras:
      c.headerGroupExtras && typeof c.headerGroupExtras === 'object'
        ? sanitizeGroupExtras(c.headerGroupExtras as Record<string, unknown>)
        : {},
    headerGroups: Array.isArray(c.headerGroups) ? c.headerGroups : [],
    headerExtras: Array.isArray(c.headerExtras) ? c.headerExtras : [],
    footerColumns: Array.isArray(c.footerColumns) ? c.footerColumns : [],
    footerBottomLinks: Array.isArray(c.footerBottomLinks) ? c.footerBottomLinks : [],
  };
}

/** Filter the headerItems blob down to entries that match the union
 *  shape — a stray object key won't crash the renderer. */
function sanitizeHeaderItems(raw: unknown[]): HeaderItem[] {
  const out: HeaderItem[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const it = r as Record<string, unknown>;
    if (it.kind === 'link' && typeof it.label === 'string' && typeof it.target === 'string') {
      out.push({ kind: 'link', label: it.label, target: it.target });
    } else if (it.kind === 'group' && typeof it.label === 'string' && Array.isArray(it.items)) {
      const items = (it.items as unknown[]).filter(
        (x): x is SiteNavLink =>
          !!x &&
          typeof x === 'object' &&
          typeof (x as SiteNavLink).label === 'string' &&
          typeof (x as SiteNavLink).target === 'string',
      );
      out.push({ kind: 'group', label: it.label, items });
    }
  }
  return out;
}

/** Drop keys whose value isn't an array — a JSON typo elsewhere in the
 *  blob shouldn't make the Header throw at render time. */
function sanitizeGroupExtras(
  raw: Record<string, unknown>,
): Record<string, SiteNavLink[]> {
  const out: Record<string, SiteNavLink[]> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (Array.isArray(v)) out[k] = v as SiteNavLink[];
  }
  return out;
}

/** Heuristic: should we route this target through the app origin
 *  (deep-link into the SPA) or keep it on the marketing site? */
const IN_SITE = new Set(['/register', '/login', '/contact', '/about', '/pricing']);
export function isInSite(target: string): boolean {
  if (!target.startsWith('/')) return false; // external URL
  return (
    IN_SITE.has(target) ||
    target.startsWith('/p/') ||
    target.startsWith('/contact') ||
    target.startsWith('/solutions/') ||
    target.startsWith('/product/') ||
    target.startsWith('/legal/') ||
    target.startsWith('/blogs') ||
    target.startsWith('/docs') ||
    target.startsWith('/customers') ||
    target.startsWith('/changelog') ||
    target.startsWith('/integrations') ||
    target.startsWith('/security') ||
    target.startsWith('/about')
  );
}
