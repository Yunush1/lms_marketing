import Link from 'next/link';

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

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-[1200px] mx-auto px-5 py-12 grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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
                <Link href={href} className="text-slate-300 hover:text-white">{label}</Link>
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
        <div className="flex gap-4">
          <Link href="/legal/terms" className="text-slate-300 hover:text-white">Terms</Link>
          <Link href="/legal/privacy" className="text-slate-300 hover:text-white">Privacy</Link>
          <Link href="/legal/dpa" className="text-slate-300 hover:text-white">DPA</Link>
          <Link href="/legal/cookies" className="text-slate-300 hover:text-white">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
