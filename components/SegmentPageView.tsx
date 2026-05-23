import Link from 'next/link';
import type { SolutionContent } from '@/lib/types';

const wrap: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 20px' };
const BRAND = '#4f46e5';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="inline -translate-y-px ml-1.5">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
const CheckDot = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" aria-hidden="true" className="inline -translate-y-px mr-2">
    <circle cx="12" cy="12" r="6" />
  </svg>
);

const ctaHref = (target: string): string => {
  if (target.startsWith('http')) return target;
  if (target.startsWith('/register') || target.startsWith('/login')) {
    return `${APP_URL}${target}`;
  }
  return target;
};

/**
 * Shared renderer for Solutions and Products pages. Same shape, same layout —
 * the SPA uses one `renderPage` helper too. Server-rendered, no client JS.
 */
export function SegmentPageView({ data }: { data: SolutionContent }) {
  return (
    <>
      <section style={{ padding: '64px 0 32px', background: 'radial-gradient(900px 360px at 50% -10%, #eef2ff 0%, #fff 60%)' }}>
        <div style={{ ...wrap, textAlign: 'center' }}>
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[13px] font-medium">
            {data.eyebrow}
          </span>
          <h1 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 800, color: '#0f172a', margin: '14px 0 10px' }}>
            {data.title}
          </h1>
          <p style={{ color: '#475569', fontSize: 17, maxWidth: 760, margin: '12px auto 0', lineHeight: 1.7 }}>
            {data.subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            <a
              href={ctaHref(data.cta.primaryTarget)}
              className="px-5 py-2.5 rounded-[10px] text-white font-medium"
              style={{ background: BRAND }}
            >
              {data.cta.primary}<ArrowIcon />
            </a>
            {data.cta.secondary && data.cta.secondaryTarget && (
              <Link
                href={data.cta.secondaryTarget}
                className="px-5 py-2.5 rounded-[10px] border border-slate-300 text-slate-900 font-medium"
              >
                {data.cta.secondary}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 0' }}>
        <div style={wrap}>
          <div className="bg-white rounded-[14px] p-6 border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
              {data.bullets.map((b) => (
                <div key={b} className="flex items-center text-slate-900 text-[14px] py-2">
                  <CheckDot />{b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {data.capabilities && data.capabilities.length > 0 && (
        <section style={{ padding: '40px 0', background: '#f8fafc' }}>
          <div style={wrap}>
            <h2 className="text-[26px] font-extrabold text-slate-900 text-center mb-7">
              What&apos;s included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.capabilities.map((c) => (
                <div key={c.title} className="bg-white rounded-[14px] p-6 border border-slate-100 h-full">
                  <div className="font-bold text-[17px] text-slate-900">{c.title}</div>
                  <div className="text-slate-500 text-sm leading-relaxed mt-1.5 mb-3">{c.body}</div>
                  <div className="flex flex-col gap-1.5">
                    {c.bullets.map((b) => (
                      <div key={b} className="flex items-start text-slate-700 text-[13px]">
                        <span className="flex-shrink-0"><CheckDot /></span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '40px 0' }}>
        <div style={wrap}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.sections.map((s) => (
              <div key={s.title} className="bg-white rounded-[14px] p-6 border border-slate-100 h-full">
                <h3 className="text-[19px] font-bold text-slate-900 m-0">{s.title}</h3>
                <p className="text-slate-600 mt-2.5 leading-loose">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {data.caseStudy && (
        <section style={{ padding: '40px 0', background: '#0f172a', color: '#e2e8f0' }}>
          <div style={wrap}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
              <div className="md:col-span-7">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-700 text-indigo-100 text-xs font-medium">Customer story</span>
                <div className="text-[22px] italic leading-relaxed mt-3.5 text-slate-100">
                  &ldquo;{data.caseStudy.quote}&rdquo;
                </div>
                <div className="mt-3.5 font-bold">{data.caseStudy.name}</div>
                <div className="text-slate-400 text-[13px]">{data.caseStudy.role}</div>
              </div>
              <div className="md:col-span-5">
                <div className="grid grid-cols-2 gap-3">
                  {data.caseStudy.metrics.map((m) => (
                    <div key={m.label} className="bg-slate-800 rounded-[12px] p-4 text-center">
                      <div className="text-[26px] font-extrabold text-white">{m.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '40px 0 80px' }}>
        <div
          className="max-w-[820px] mx-auto px-7 py-10 rounded-[20px] text-center text-white"
          style={{ background: BRAND }}
        >
          <h2 className="text-2xl font-extrabold m-0">Ready to try EduSphere?</h2>
          <p className="opacity-90 mt-2.5">Start free with up to 50 students. No card required.</p>
          <div className="flex gap-3 justify-center flex-wrap mt-4">
            <a href={ctaHref(data.cta.primaryTarget)} className="px-5 py-2.5 rounded-lg bg-white text-slate-900 font-medium">
              {data.cta.primary}
            </a>
            <Link href="/pricing" className="px-5 py-2.5 rounded-lg border border-white/70 text-white font-medium">
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
