import type { Metadata } from 'next';
import Link from 'next/link';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata, JsonLd, SITE_URL } from '@/lib/seo';
import { HOME_FALLBACK, PRICING_FALLBACK } from '@/data/fallback';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

// Regenerate this page at most once every 10 minutes (matches the backend
// Redis cache TTL). Visitors always get instant static HTML.
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'home',
    title: 'EduSphere — The operating system for modern schools',
    bareTitle: true,
    description:
      'Academics, attendance, exams, fees and parent communication in one secure, multi-tenant platform. Start free.',
    path: '/',
  });
}

// Inline icons — keep SSR HTML lean (no icon library shipped to client).
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="inline -translate-y-px ml-1.5">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline -translate-y-px">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const DotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" aria-hidden="true" className="inline -translate-y-px">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

export default async function HomePage() {
  // Same defensive merge — protects against partial CMS overrides during ISR.
  const liveHome = await marketingApi.getHome();
  const livePricing = await marketingApi.getPricing();
  const content = { ...HOME_FALLBACK, ...(liveHome ?? {}) };
  const pricing = { ...PRICING_FALLBACK, ...(livePricing ?? {}) };
  if (!content.hero) content.hero = HOME_FALLBACK.hero;
  const faqs = pricing.faqs?.length ? pricing.faqs : PRICING_FALLBACK.faqs;
  const [titleA, titleB] = content.hero.title.split('\n');

  return (
    <div>
      {/* Hero */}
      <section
        className="py-20 md:py-24"
        style={{ background: 'radial-gradient(1200px 500px at 50% -10%, var(--color-brand-50) 0%, #fff 60%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-600)] text-[13px] font-medium mb-5">
            {content.hero.eyebrow}
          </span>
          <h1 className="text-[clamp(34px,5vw,58px)] leading-[1.08] m-0 text-slate-900 font-extrabold">
            {titleA}{titleB ? <><br />{titleB}</> : null}
          </h1>
          <p className="text-lg text-slate-600 max-w-[700px] mx-auto mt-5 mb-8 leading-relaxed">
            {content.hero.subtitle}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={`${APP_URL}${content.hero.primaryCta.target}`}
              className="px-5 py-2.5 rounded-[10px] text-white font-medium"
              style={{ background: 'var(--color-brand)' }}
            >
              {content.hero.primaryCta.label}<ArrowIcon />
            </a>
            <Link
              href={content.hero.secondaryCta.target}
              className="px-5 py-2.5 rounded-[10px] border border-slate-300 text-slate-900 font-medium"
            >
              {content.hero.secondaryCta.label}
            </Link>
          </div>
          <div className="mt-4 text-slate-500 text-[13px]">
            {content.hero.bullets.map((b, i) => (
              <span key={b}>
                {i > 0 && <>&nbsp;·&nbsp;</>}
                <CheckIcon /> {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-3 pb-12">
        <div className="max-w-[1200px] mx-auto px-5 text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-3.5">
            Trusted by schools and coaching groups
          </div>
          <div className="flex gap-7 justify-center flex-wrap opacity-70">
            {content.trustLogos.map((name) => (
              <div key={name} className="font-bold text-slate-600 text-[15px]">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-layer story */}
      <section className="py-8 pb-14">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="text-center max-w-[720px] mx-auto mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 m-0">
              One platform. Three layers of your school.
            </h2>
            <p className="text-slate-500 mt-2.5">
              Instead of stitching together a dozen tools, run academics,
              operations and communication off a single tenant.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.layers.map((l) => (
              <div key={l.title} className="bg-white border border-slate-100 rounded-[14px] p-6 shadow-sm">
                <div className="text-2xl mb-2.5" style={{ color: 'var(--color-brand)' }} aria-hidden>■</div>
                <div className="font-bold text-lg text-slate-900 mb-1.5">{l.title}</div>
                <div className="text-slate-500 text-[14px] leading-7 mb-3">{l.body}</div>
                <div className="flex flex-col gap-1.5">
                  {l.points.map((p) => (
                    <div key={p} className="flex gap-2 text-slate-700 text-[13px] items-start">
                      <span className="flex-shrink-0 mt-1"><DotIcon /></span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="py-10 bg-slate-900 text-slate-200">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.outcomes.map((o) => (
              <div key={o.label}>
                <div className="text-[44px] font-extrabold text-white">{o.stat}</div>
                <div className="text-base text-slate-300 mt-1">{o.label}</div>
                <div className="text-xs text-slate-400 mt-1.5 leading-relaxed">{o.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-5">
          <h2 className="text-center text-[26px] font-extrabold text-slate-900 mb-7">
            Schools running on EduSphere
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-[14px] p-6 shadow-sm border border-slate-100">
                <div className="text-slate-700 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</div>
                <div className="mt-4 font-bold text-slate-900">{t.name}</div>
                <div className="text-slate-500 text-[13px]">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10">
        <div className="max-w-[820px] mx-auto px-5">
          <h2 className="text-center text-[26px] font-extrabold text-slate-900 mb-5">
            Common questions
          </h2>
          <div className="space-y-3">
            {content.faqIds
              .map((idx) => faqs[idx])
              .filter(Boolean)
              .map((f, i) => (
                <details key={i} className="bg-white border border-slate-200 rounded-[10px] p-4 group">
                  <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    {f.q}
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="text-slate-600 leading-relaxed mt-3 mb-0">{f.a}</p>
                </details>
              ))}
          </div>
          <div className="text-center mt-4">
            <Link href="/pricing" className="font-semibold" style={{ color: 'var(--color-brand)' }}>
              See all plans &amp; FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="py-14">
        <div
          className="max-w-[1200px] mx-auto px-8 py-12 rounded-[20px] text-center text-white"
          style={{ background: 'var(--color-brand)' }}
        >
          <h2 className="text-3xl font-extrabold m-0">Ready to modernise your school?</h2>
          <p className="opacity-90 mt-3 mb-6">
            Free for up to 50 students. 14-day trial on every paid plan.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={`${APP_URL}/register`}
              className="px-5 py-2.5 rounded-lg bg-white text-slate-900 font-medium"
            >
              Create your school
            </a>
            <Link
              href="/contact?intent=demo"
              className="px-5 py-2.5 rounded-lg border border-white/70 text-white font-medium"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'EduSphere',
          url: `${SITE_URL}/`,
          sameAs: [],
        }}
      />
    </div>
  );
}
