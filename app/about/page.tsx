import type { Metadata } from 'next';
import Link from 'next/link';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { ABOUT_FALLBACK } from '@/data/static-pages';
import type { AboutContent } from '@/lib/types';

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

/**
 * Merge admin overrides over the bundled fallback. Top-level keys the admin
 * touched replace the fallback wholesale (matches the rest of the CMS); we
 * defensively repair empty arrays so a stray `[]` from the editor doesn't
 * blank the page.
 */
function resolveAboutContent(row: unknown): AboutContent {
  const override = (row && typeof row === 'object' && 'content' in row
    ? (row as { content?: Partial<AboutContent> }).content
    : null) ?? {};
  const merged: AboutContent = { ...ABOUT_FALLBACK, ...override };
  if (!merged.hero || !merged.hero.title) merged.hero = ABOUT_FALLBACK.hero;
  if (!merged.stats?.length) merged.stats = ABOUT_FALLBACK.stats;
  if (!merged.beliefs?.length) merged.beliefs = ABOUT_FALLBACK.beliefs;
  if (!merged.ctas?.length) merged.ctas = ABOUT_FALLBACK.ctas;
  return merged;
}

// `/register` and `/login` stay on the marketing site; anything else routes
// through to the SPA app origin.
const IN_SITE = new Set(['/register', '/login', '/contact', '/about', '/pricing']);
const ctaHref = (target: string) =>
  IN_SITE.has(target) || target.startsWith('/contact') || target.startsWith('/legal')
    ? target
    : `${APP_URL}${target}`;

export default async function AboutPage() {
  const row = await marketingApi.getPage('about');
  const content = resolveAboutContent(row);

  return (
    <div className="py-16">
      <div className="max-w-[1000px] mx-auto px-5">
        <h1 className="text-[clamp(28px,4vw,44px)] font-extrabold text-slate-900 m-0">
          {content.hero.title}
        </h1>
        <p className="text-slate-600 text-lg leading-loose mt-5">{content.hero.intro}</p>
        {content.hero.body && (
          <p className="text-slate-600 text-base leading-loose">{content.hero.body}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12">
          {content.stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold" style={{ color: 'var(--color-brand)' }}>
                {s.value}
              </div>
              <div className="text-slate-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {content.beliefsHeading && (
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">
            {content.beliefsHeading}
          </h2>
        )}
        <ul className="space-y-3 text-slate-600 leading-relaxed">
          {content.beliefs.map((b) => (
            <li key={b.strong}>
              <strong className="text-slate-900">{b.strong}</strong> {b.rest}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex gap-3 flex-wrap">
          {content.ctas.map((cta) => (
            <Link
              key={cta.label}
              href={ctaHref(cta.target)}
              className={`px-5 py-2.5 rounded-[10px] font-medium ${
                cta.primary
                  ? 'text-white'
                  : 'border border-slate-300 text-slate-900'
              }`}
              style={cta.primary ? { background: 'var(--color-brand)' } : undefined}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
