import type { Metadata } from 'next';
import Link from 'next/link';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { CUSTOMERS as CUSTOMERS_FALLBACK } from '@/data/segments';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'customers',
    title: 'Customers',
    description: 'Schools and groups running their day-to-day on EduSphere.',
    path: '/customers',
  });
}

export default async function CustomersPage() {
  const customers = (await marketingApi.listCustomers()) ?? CUSTOMERS_FALLBACK;

  return (
    <>
      <section className="py-16 pb-8 text-center" style={{ background: 'radial-gradient(900px 360px at 50% -10%, #eef2ff 0%, #fff 60%)' }}>
        <div className="max-w-[1100px] mx-auto px-5">
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[13px] font-medium">Customers</span>
          <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold text-slate-900 mt-3 mb-2">
            Schools that trust EduSphere with their day-to-day
          </h1>
          <p className="text-slate-600 text-[17px] max-w-[720px] mx-auto mt-2 leading-relaxed">
            From single schools to multi-campus groups, here&apos;s who runs on the platform.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-[1100px] mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {customers.map((c) => (
            <div key={c.name} className="bg-white rounded-[14px] p-6 border border-slate-100 h-full">
              <div className="font-bold text-[18px] text-slate-900">{c.name}</div>
              <div className="text-slate-500 text-[13px]">{c.location} · {c.size}</div>
              <div className="mt-4 text-slate-700 italic leading-relaxed">&ldquo;{c.quote}&rdquo;</div>
              <div className="mt-4 flex gap-3 flex-wrap">
                {c.metrics.map((m) => (
                  <div key={m.label} className="bg-slate-50 rounded-[10px] px-3.5 py-2.5 flex-1 min-w-[120px]">
                    <div className="text-[18px] font-extrabold" style={{ color: 'var(--color-brand)' }}>{m.value}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 pb-20">
        <div
          className="max-w-[820px] mx-auto px-7 py-10 rounded-[20px] text-center text-white"
          style={{ background: 'var(--color-brand)' }}
        >
          <h2 className="text-2xl font-extrabold m-0">Want to be our next case study?</h2>
          <p className="opacity-90 mt-2.5">Tell us about your school and we&apos;ll tailor a rollout plan.</p>
          <Link href="/contact" className="inline-block mt-4 px-5 py-2 rounded-lg bg-white text-slate-900 font-medium">
            Talk to our team
          </Link>
        </div>
      </section>
    </>
  );
}
