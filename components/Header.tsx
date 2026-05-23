import Link from 'next/link';
import { MobileMenu } from './MobileMenu';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

interface NavLeaf { to: string; label: string }
interface NavGroup { label: string; items: NavLeaf[] }

const NAV: (NavLeaf | NavGroup)[] = [
  {
    label: 'Product',
    items: [
      { to: '/product/academics', label: 'Academics' },
      { to: '/product/fees-billing', label: 'Fees & Billing' },
      { to: '/product/staff-payroll', label: 'Staff & Payroll' },
      { to: '/product/parents', label: 'Parent Engagement' },
      { to: '/product/reports', label: 'Reports & Insights' },
    ],
  },
  {
    label: 'Solutions',
    items: [
      { to: '/solutions/schools', label: 'Single school' },
      { to: '/solutions/groups', label: 'Multi-campus groups' },
      { to: '/solutions/coaching', label: 'Coaching & tutoring' },
    ],
  },
  { to: '/pricing', label: 'Pricing' },
  { to: '/customers', label: 'Customers' },
  {
    label: 'Resources',
    items: [
      { to: '/blogs', label: 'Blog' },
      { to: '/docs', label: 'Docs' },
      { to: '/changelog', label: 'Changelog' },
      { to: '/integrations', label: 'Integrations' },
    ],
  },
  {
    label: 'Company',
    items: [
      { to: '/about', label: 'About' },
      { to: '/security', label: 'Security & trust' },
      { to: '/contact', label: 'Contact' },
    ],
  },
];

const isGroup = (n: NavLeaf | NavGroup): n is NavGroup => 'items' in n;

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
 * Server-rendered header. Desktop nav uses a CSS-only hover dropdown (no
 * JS shipped for nav). The mobile drawer is the only client-side piece
 * and is split into its own client component to keep the JS payload small.
 */
export function Header() {
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
          {NAV.map((n) =>
            isGroup(n) ? (
              <div key={n.label} className="relative group">
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
                  {n.items.map((i) => (
                    <Link
                      key={i.to}
                      href={i.to}
                      className="block px-3 py-2 text-sm text-slate-900 rounded-md hover:bg-slate-100"
                    >
                      {i.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={n.to}
                href={n.to}
                className="text-slate-700 hover:text-[var(--color-brand)] font-medium py-1.5"
              >
                {n.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden md:flex gap-2 items-center">
          <a
            href={`${APP_URL}/login`}
            className="px-4 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Sign in
          </a>
          <a
            href={`${APP_URL}/register`}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--color-brand)' }}
          >
            Start free
          </a>
        </div>

        <MobileMenu nav={NAV} appUrl={APP_URL} />
      </div>
    </header>
  );
}
