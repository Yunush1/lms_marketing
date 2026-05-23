import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

// About copy doesn't change often — once a day is plenty. Bump to 0 if you
// want every request to consult the CMS.
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'about',
    title: 'About',
    description:
      'EduSphere builds one secure, multi-tenant platform that unifies academics, fees, staff and parent communication for modern schools.',
    path: '/about',
  });
}

const STATS = [
  { label: 'Schools onboarded', value: '120+' },
  { label: 'Students managed', value: '85,000+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Avg. onboarding', value: '1 day' },
];

export default function AboutPage() {
  return (
    <div className="py-16">
      <div className="max-w-[1000px] mx-auto px-5">
        <h1 className="text-[clamp(28px,4vw,44px)] font-extrabold text-slate-900 m-0">
          We build software schools actually enjoy using
        </h1>
        <p className="text-slate-600 text-lg leading-loose mt-5">
          EduSphere started with a simple belief: school administrators spend
          far too much time fighting spreadsheets and disconnected tools. We set
          out to build one secure, multi-tenant platform that unifies
          academics, fees, staff and parent communication — without sacrificing
          the strict data isolation every institution deserves.
        </p>
        <p className="text-slate-600 text-base leading-loose">
          Today, schools and multi-campus groups run their day-to-day
          operations on EduSphere — from admissions to report cards to online
          fee collection — backed by role-based access control and realtime
          notifications.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold" style={{ color: 'var(--color-brand)' }}>
                {s.value}
              </div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">What we believe</h2>
        <ul className="space-y-3 text-slate-600 leading-relaxed">
          <li><strong className="text-slate-900">Tenant isolation is non-negotiable.</strong> Every privileged query is scoped by the school in your JWT.</li>
          <li><strong className="text-slate-900">Software should fade into the background.</strong> Two taps to mark attendance. One screen to reconcile fees.</li>
          <li><strong className="text-slate-900">Schools deserve real support.</strong> Real humans, not ticket queues that go nowhere.</li>
        </ul>

        <div className="mt-12 flex gap-3 flex-wrap">
          <a
            href={`${APP_URL}/register`}
            className="px-5 py-2.5 rounded-[10px] text-white font-medium"
            style={{ background: 'var(--color-brand)' }}
          >
            Start free
          </a>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-[10px] border border-slate-300 text-slate-900 font-medium"
          >
            Talk to our team
          </Link>
        </div>
      </div>
    </div>
  );
}
