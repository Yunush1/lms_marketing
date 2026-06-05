import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import { getCurrentUser } from '@/lib/auth-server';
import {
  BUNDLED_HEADER_NAV,
  getSiteNav,
  type HeaderItem,
  type SiteNavConfig,
  type SiteNavLink,
} from '@/lib/site-nav';

/**
 * Decide which nav structure to render.
 *  - If the editor has clicked "Sync current navbar" (so headerItems
 *    is populated), that's the source of truth. Bundled defaults stop
 *    being used at all.
 *  - Otherwise we use the bundled list and layer any legacy "extras"
 *    fields the editor may still have on top — preserves prior
 *    behaviour for users who customised before headerItems landed.
 */
function resolveHeader(siteNav: SiteNavConfig): HeaderItem[] {
  if (siteNav.headerItems.length > 0) return siteNav.headerItems;

  // Append-only legacy mode — fold headerGroupExtras into matching
  // bundled groups, then append custom dropdowns + flat extras.
  const next: HeaderItem[] = BUNDLED_HEADER_NAV.map((it) => {
    if (it.kind === 'link') return it;
    const more = siteNav.headerGroupExtras[it.label] ?? [];
    if (more.length === 0) return it;
    return { kind: 'group', label: it.label, items: [...it.items, ...more] };
  });
  for (const g of siteNav.headerGroups) {
    if (!g.heading.trim()) continue;
    next.push({ kind: 'group', label: g.heading, items: g.items });
  }
  for (const e of siteNav.headerExtras) {
    if (!e.label.trim()) continue;
    next.push({ kind: 'link', label: e.label, target: e.target });
  }
  return next;
}

const isGroup = (n: HeaderItem): n is Extract<HeaderItem, { kind: 'group' }> =>
  n.kind === 'group';

/** Single link renderer — picks `<a target="_blank">` for absolute URLs
 *  so editors can drop in external targets without surprises. */
function NavLink({
  link,
  className,
}: {
  link: SiteNavLink | { label: string; target: string };
  className: string;
}) {
  return link.target.startsWith('http') ? (
    <a href={link.target} target="_blank" rel="noopener noreferrer" className={className}>
      {link.label}
    </a>
  ) : (
    <Link href={link.target} className={className}>
      {link.label}
    </Link>
  );
}

const LogoMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/**
 * Server-rendered header. Reads the auth cookie so the right-rail CTA
 * flips between "Sign in / Start free" (anonymous) and a clickable
 * "Account" chip showing the user's initial + name (authenticated). No
 * client hydration is required for the auth state — every request comes
 * back with the correct chip already rendered.
 */
export async function Header() {
  // Two parallel reads — the user (cookie + /auth/me) and the site-nav
  // overrides from the CMS. Both are server-side, both are cached at
  // their own layers, so this doesn't add a round-trip on the hot path.
  const [user, siteNav] = await Promise.all([getCurrentUser(), getSiteNav()]);
  const items = resolveHeader(siteNav);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-100">
      <div className="max-w-[1200px] mx-auto px-5 py-3.5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] text-white"
            style={{ background: 'var(--color-brand)' }}
          >
            <LogoMark />
          </span>
          <span className="font-extrabold text-lg text-slate-900">EduSphere</span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          {items
            .filter((n) => n.label.trim())
            .map((n, idx) =>
              isGroup(n) ? (
                <div key={`${n.label}-${idx}`} className="relative group">
                  <span className="text-slate-700 hover:text-[var(--color-brand)] cursor-pointer flex items-center font-medium py-1.5">
                    {n.label} <ChevronIcon />
                  </span>
                  <div
                    className="
                      absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-[10px]
                      shadow-[0_8px_28px_rgba(15,23,42,0.12)] p-1.5 min-w-[200px]
                      invisible opacity-0 group-hover:visible group-hover:opacity-100
                      transition-opacity z-[60]
                    "
                  >
                    {n.items
                      .filter((i) => i.label.trim() && i.target.trim())
                      .map((i, j) => (
                        <NavLink
                          key={`${n.label}-${i.label}-${j}`}
                          link={i}
                          className="block px-3 py-2 text-sm text-slate-900 rounded-md hover:bg-slate-100"
                        />
                      ))}
                  </div>
                </div>
              ) : (
                <NavLink
                  key={`${n.label}-${n.target}-${idx}`}
                  link={n}
                  className="text-slate-700 hover:text-[var(--color-brand)] font-medium py-1.5"
                />
              ),
            )}
        </nav>

        <div className="hidden md:flex gap-2 items-center">
          {user ? (
            <Link
              href="/me"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition"
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-bold"
                style={{ background: 'var(--color-brand)' }}
                aria-hidden
              >
                {(user.firstName?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </span>
              <span className="text-[14px] font-medium text-slate-700">
                {user.firstName || 'Account'}
              </span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--color-brand)' }}
              >
                Start free
              </Link>
            </>
          )}
        </div>

        <MobileMenu nav={items} authedFirstName={user?.firstName ?? null} />
      </div>
    </header>
  );
}
