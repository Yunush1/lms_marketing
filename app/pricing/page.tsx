import type { Metadata } from 'next';
import Link from 'next/link';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata, SITE_URL } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { PRICING_FALLBACK } from '@/data/fallback';
import type { MarketingPlanContent } from '@/lib/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'pricing',
    title: 'Pricing — EduSphere school management platform',
    bareTitle: true,
    description:
      'Simple, transparent pricing for schools and multi-campus groups. Start free, upgrade as you grow. Cancel anytime.',
    path: '/pricing',
  });
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 -translate-y-px">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const formatPrice = (rupees: number) =>
  rupees === 0 ? '₹0' : `₹${rupees.toLocaleString('en-IN')}`;

// `/register` and `/login` stay on the marketing site (in-app routing,
// no full page load). Everything else opens in the SPA.
const IN_SITE_TARGETS = new Set(['/register', '/login', '/contact']);
const planCtaHref = (p: MarketingPlanContent) => {
  if (p.contactSales) return p.ctaTarget;
  if (IN_SITE_TARGETS.has(p.ctaTarget)) return p.ctaTarget;
  return `${APP_URL}${p.ctaTarget}`;
};

export default async function PricingPage() {
  const live = await marketingApi.getPricing();
  const pricing = { ...PRICING_FALLBACK, ...(live ?? {}) };
  if (!pricing.plans?.length) pricing.plans = PRICING_FALLBACK.plans;
  if (!pricing.faqs?.length) pricing.faqs = PRICING_FALLBACK.faqs;

  return (
    <div>
      <section className="py-16 text-center">
        <div className="max-w-[1100px] mx-auto px-5">
          <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold text-slate-900 m-0">
            Simple pricing that grows with your school
          </h1>
          <p className="text-slate-500 text-lg max-w-[620px] mx-auto mt-3 leading-relaxed">
            Start free. Switch plans any time. Cancel any time. We never store your card data.
          </p>
        </div>
      </section>

      {/* Plans grid */}
      <section className="pb-12">
        <div className="max-w-[1100px] mx-auto px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricing.plans.map((p) => (
            <div
              key={p.tier}
              className={`bg-white rounded-[14px] p-6 border ${p.isPopular ? 'border-[var(--color-brand)] shadow-lg' : 'border-slate-200'} relative flex flex-col`}
            >
              {p.isPopular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white"
                  style={{ background: 'var(--color-brand)' }}
                >
                  POPULAR
                </span>
              )}
              <div className="text-lg font-extrabold text-slate-900">{p.name}</div>
              <div className="text-slate-500 text-[13px] mt-1 min-h-[36px]">{p.tagline}</div>
              <div className="mt-4 mb-4">
                {p.contactSales ? (
                  <div className="text-2xl font-extrabold text-slate-900">Custom</div>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-slate-900">{formatPrice(p.monthlyPrice)}</span>
                    <span className="text-slate-500 text-sm">/mo</span>
                    {p.annualPrice != null && p.annualPrice < p.monthlyPrice ? (
                      <div className="text-xs text-emerald-600 mt-1">
                        or {formatPrice(p.annualPrice)}/mo billed yearly
                      </div>
                    ) : null}
                  </>
                )}
              </div>
              <div className="space-y-2 flex-1">
                {p.highlights.map((h) => (
                  <div key={h} className="flex items-start text-slate-700 text-[14px]">
                    <span className="flex-shrink-0"><CheckIcon /></span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
              {p.contactSales ? (
                <Link
                  href={p.ctaTarget}
                  className="mt-5 block text-center px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium"
                >
                  {p.ctaLabel}
                </Link>
              ) : (
                <a
                  href={planCtaHref(p)}
                  className={`mt-5 block text-center px-4 py-2 rounded-lg font-medium ${p.isPopular ? 'text-white' : 'border border-slate-300 text-slate-900'}`}
                  style={p.isPopular ? { background: 'var(--color-brand)' } : undefined}
                >
                  {p.ctaLabel}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-[820px] mx-auto px-5">
          <h2 className="text-center text-[26px] font-extrabold text-slate-900 mb-5">
            Pricing FAQs
          </h2>
          <div className="space-y-3">
            {pricing.faqs.map((f, i) => (
              <details key={i} className="bg-white border border-slate-200 rounded-[10px] p-4 group">
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-slate-600 leading-relaxed mt-3 mb-0">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'EduSphere',
          description: 'Multi-tenant school management platform.',
          offers: pricing.plans
            .filter((p) => !p.contactSales)
            .map((p) => ({
              '@type': 'Offer',
              name: p.name,
              price: p.monthlyPrice,
              priceCurrency: 'INR',
              url: `${SITE_URL}/pricing`,
            })),
        }}
      />
    </div>
  );
}
