import Link from 'next/link';
import { getSiteNav } from '@/lib/site-nav';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      ['Academics', '/product/academics'],
      ['Fees & Billing', '/product/fees-billing'],
      ['Staff & Payroll', '/product/staff-payroll'],
      ['Parents', '/product/parents'],
      ['Reports', '/product/reports'],
    ],
  },
  {
    title: 'Solutions',
    links: [
      ['Single school', '/solutions/schools'],
      ['Multi-campus', '/solutions/groups'],
      ['Coaching', '/solutions/coaching'],
      ['Pricing', '/pricing'],
      ['Customers', '/customers'],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Blog', '/blogs'],
      ['Docs', '/docs'],
      ['Changelog', '/changelog'],
      ['Integrations', '/integrations'],
      ['Security', '/security'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About', '/about'],
      ['Contact', '/contact'],
    ],
  },
] as const;

/**
 * Render a single footer link — uses next/link for internal targets
 * and an `<a target="_blank">` for absolute URLs so editors can drop
 * in a status-page or press-kit link cleanly.
 */
function FooterLink({ label, target }: { label: string; target: string }) {
  const external = target.startsWith('http');
  return external ? (
    <a
      href={target}
      target="_blank"
      rel="noopener noreferrer"
      className="text-slate-300 hover:text-white"
    >
      {label}
    </a>
  ) : (
    <Link href={target} className="text-slate-300 hover:text-white">
      {label}
    </Link>
  );
}

export async function Footer() {
  // Pull the CMS-managed extras so editors can add their own columns
  // and bottom-row links without a deploy. Returns an empty config
  // when the CMS row is missing — the bundled defaults below carry
  // the site through that case.
  const siteNav = await getSiteNav();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div
        className="max-w-[1200px] mx-auto px-5 py-12 grid gap-8"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        <div>
          <div className="font-extrabold text-lg text-white mb-2">EduSphere</div>
          <div className="text-[13px] leading-7">
            The operating system for modern schools — academics, fees, staff
            and parent communication in one secure, multi-tenant platform.
          </div>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="text-white font-bold mb-2.5">{col.title}</div>
            {col.links.map(([label, href]) => (
              <div key={href} className="mb-2">
                <FooterLink label={label} target={href} />
              </div>
            ))}
          </div>
        ))}

        {/* CMS-added columns. Empty headings are dropped so a half-edited
            row never ships a blank column to production. */}
        {siteNav.footerColumns
          .filter((c) => c.heading.trim())
          .map((col) => (
            <div key={`cms-${col.heading}`}>
              <div className="text-white font-bold mb-2.5">{col.heading}</div>
              {col.items
                .filter((it) => it.label.trim() && it.target.trim())
                .map((it) => (
                  <div key={`${col.heading}-${it.label}`} className="mb-2">
                    <FooterLink label={it.label} target={it.target} />
                  </div>
                ))}
            </div>
          ))}

        <div>
          <div className="text-white font-bold mb-2.5">Get in touch</div>
          <div className="text-[13px] mb-2">sales@edusphere.app</div>
          <a
            href={`${APP_URL}/register`}
            className="inline-block px-3 py-1.5 rounded-md text-[13px] text-white"
            style={{ background: 'var(--color-brand)' }}
          >
            Start free
          </a>
        </div>
      </div>
      <div className="border-t border-slate-800 px-5 py-4 flex justify-between items-center flex-wrap gap-2 text-xs">
        <div>© {new Date().getFullYear()} EduSphere. All rights reserved.</div>
        <div className="flex gap-4 flex-wrap">
          <Link href="/legal/terms" className="text-slate-300 hover:text-white">
            Terms
          </Link>
          <Link href="/legal/privacy" className="text-slate-300 hover:text-white">
            Privacy
          </Link>
          <Link href="/legal/dpa" className="text-slate-300 hover:text-white">
            DPA
          </Link>
          <Link href="/legal/cookies" className="text-slate-300 hover:text-white">
            Cookies
          </Link>
          {/* CMS-managed bottom-row extras — same hover treatment as the
              bundled legal links so they sit in cleanly. */}
          {siteNav.footerBottomLinks
            .filter((it) => it.label.trim() && it.target.trim())
            .map((it) => (
              <FooterLink
                key={`bottom-${it.label}-${it.target}`}
                label={it.label}
                target={it.target}
              />
            ))}
        </div>
      </div>
    </footer>
  );
}
