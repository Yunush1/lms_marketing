import type { Metadata } from 'next';
import Link from 'next/link';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { SECURITY_FALLBACK } from '@/data/static-pages';
import type { SecurityContent } from '@/lib/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'security',
    title: 'Security & Trust',
    description:
      'How EduSphere protects your school data — multi-tenant isolation, RBAC, encryption, audit logs, and our security roadmap.',
    path: '/security',
  });
}

function resolveSecurityContent(row: unknown): SecurityContent {
  const override = (row && typeof row === 'object' && 'content' in row
    ? (row as { content?: Partial<SecurityContent> }).content
    : null) ?? {};
  const merged: SecurityContent = {
    ...SECURITY_FALLBACK,
    ...override,
    hero: { ...SECURITY_FALLBACK.hero, ...(override.hero ?? {}) },
    cta: { ...SECURITY_FALLBACK.cta, ...(override.cta ?? {}) },
  };
  if (!merged.pillars?.length) merged.pillars = SECURITY_FALLBACK.pillars;
  if (!merged.certifications?.length) merged.certifications = SECURITY_FALLBACK.certifications;
  if (!merged.subprocessors?.length) merged.subprocessors = SECURITY_FALLBACK.subprocessors;
  return merged;
}

const toneStyle: Record<string, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  soon: 'bg-amber-50 text-amber-700 border-amber-200',
  na: 'bg-slate-50 text-slate-600 border-slate-200',
};

const IN_SITE = new Set(['/register', '/login', '/contact', '/about', '/pricing']);
const targetHref = (target: string) =>
  IN_SITE.has(target) || target.startsWith('/contact') || target.startsWith('/legal')
    ? target
    : `${APP_URL}${target}`;

export default async function SecurityPage() {
  const row = await marketingApi.getPage('security');
  const content = resolveSecurityContent(row);
  const [titleA, titleB] = content.hero.title.split('\n');

  return (
    <>
      <section className="py-16 pb-8" style={{ background: 'radial-gradient(900px 360px at 50% -10%, #eef2ff 0%, #fff 60%)' }}>
        <div className="max-w-[1100px] mx-auto px-5 text-center">
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[13px] font-medium">
            {content.hero.eyebrow}
          </span>
          <h1 className="text-[clamp(28px,4vw,46px)] font-extrabold text-slate-900 mt-3.5 mb-2.5">
            {titleA}
            {titleB ? <><br />{titleB}</> : null}
          </h1>
          <p className="text-slate-600 text-[17px] max-w-[760px] mx-auto mt-3 leading-relaxed">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-[1100px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {content.pillars.map((p) => (
            <div key={p.title} className="bg-white rounded-[14px] p-6 border border-slate-100">
              <div className="text-2xl" style={{ color: 'var(--color-brand)' }}>{p.icon}</div>
              <div className="font-bold text-[17px] text-slate-900 mt-2 mb-1.5">{p.title}</div>
              <div className="text-slate-600 text-sm leading-relaxed">{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 bg-slate-50">
        <div className="max-w-[1100px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 m-0">Compliance &amp; certifications</h2>
            <p className="text-slate-500 mt-2">Where we are today and where we are heading.</p>
            <div className="mt-4 flex flex-col gap-3">
              {content.certifications.map((c) => (
                <div key={c.label} className="flex justify-between items-center px-4 py-3 bg-white rounded-[10px] border border-slate-200">
                  <span className="font-semibold text-slate-900">{c.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${toneStyle[c.tone] ?? toneStyle.na}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[22px] font-extrabold text-slate-900 m-0">Subprocessors</h2>
            <p className="text-slate-500 mt-2">Third parties that touch tenant data — listed for transparency.</p>
            <div className="mt-4 flex flex-col gap-3">
              {content.subprocessors.map((s) => (
                <div key={s.name} className="px-4 py-3 bg-white rounded-[10px] border border-slate-200">
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-slate-600 text-[13px] mt-0.5">{s.purpose} · {s.region}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-[1100px] mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-[14px] p-6 border border-slate-100">
            <div className="text-2xl" style={{ color: 'var(--color-brand)' }}>📄</div>
            <div className="font-bold mt-2.5 text-slate-900">Data processing addendum</div>
            <div className="text-slate-600 text-[13px] mt-1.5 leading-relaxed">
              Our standard DPA covers controller/processor obligations under GDPR and the India DPDP Act.
            </div>
            <Link href="/legal/dpa" className="inline-block mt-2.5 font-semibold" style={{ color: 'var(--color-brand)' }}>
              View DPA →
            </Link>
          </div>
          <div className="bg-white rounded-[14px] p-6 border border-slate-100">
            <div className="text-2xl" style={{ color: 'var(--color-brand)' }}>🔌</div>
            <div className="font-bold mt-2.5 text-slate-900">Responsible disclosure</div>
            <div className="text-slate-600 text-[13px] mt-1.5 leading-relaxed">
              Found a vulnerability? Report it confidentially to{' '}
              <a href="mailto:security@edusphere.app" className="underline" style={{ color: 'var(--color-brand)' }}>
                security@edusphere.app
              </a>
              . We respond within one business day.
            </div>
          </div>
          <div className="bg-white rounded-[14px] p-6 border border-slate-100">
            <div className="text-2xl" style={{ color: 'var(--color-brand)' }}>☁️</div>
            <div className="font-bold mt-2.5 text-slate-900">System status</div>
            <div className="text-slate-600 text-[13px] mt-1.5 leading-relaxed">
              Realtime uptime and incident history is published on our public status page.
            </div>
            <Link href="/changelog" className="inline-block mt-2.5 font-semibold text-[13px]" style={{ color: 'var(--color-brand)' }}>
              View changelog →
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 pb-16">
        <div
          className="max-w-[820px] mx-auto px-7 py-10 rounded-[20px] text-center text-white"
          style={{ background: 'var(--color-brand)' }}
        >
          <h2 className="text-2xl font-extrabold m-0">{content.cta.title}</h2>
          <p className="opacity-90 mt-2.5">{content.cta.subtitle}</p>
          <a
            href={targetHref(content.cta.target)}
            className="inline-block mt-4 px-5 py-2 rounded-lg bg-white text-slate-900 font-medium"
          >
            {content.cta.label}
          </a>
        </div>
      </section>
    </>
  );
}
