import type { Metadata } from 'next';
import Link from 'next/link';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { INTEGRATIONS as INTEGRATIONS_FALLBACK } from '@/data/segments';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'integrations',
    title: 'Integrations',
    description:
      'Payments, identity, storage and messaging — EduSphere connects to the tools your school already uses.',
    path: '/integrations',
  });
}

const statusStyle = (status: string) =>
  status === 'Live'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-amber-50 text-amber-700 border-amber-200';

export default async function IntegrationsPage() {
  const integrations = (await marketingApi.listIntegrations()) ?? INTEGRATIONS_FALLBACK;

  return (
    <>
      <section className="py-16 pb-8 text-center" style={{ background: 'radial-gradient(900px 360px at 50% -10%, #eef2ff 0%, #fff 60%)' }}>
        <div className="max-w-[1100px] mx-auto px-5">
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[13px] font-medium">Integrations</span>
          <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold text-slate-900 mt-3 mb-2">
            Connect the tools your school already runs on
          </h1>
          <p className="text-slate-600 text-[17px] max-w-[720px] mx-auto mt-2 leading-relaxed">
            Payments, identity, messaging and storage — wired in, with more on the way.
          </p>
        </div>
      </section>

      <section className="py-10 pb-16">
        <div className="max-w-[1100px] mx-auto px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {integrations.map((i) => (
              <div key={i.name} className="bg-white rounded-[14px] p-6 border border-slate-100 h-full">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle(i.status)}`}>{i.status}</span>
                <div className="font-bold text-[17px] text-slate-900 mt-2.5">{i.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{i.tag}</div>
                <div className="text-slate-600 text-[13px] leading-relaxed mt-2.5">{i.body}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 px-7 py-6 bg-slate-50 rounded-[14px] flex justify-between items-center gap-4 flex-wrap">
            <div>
              <div className="font-bold text-slate-900">Missing an integration?</div>
              <div className="text-slate-500 text-[13px]">
                Tell us what you need — popular requests get prioritised on the roadmap.
              </div>
            </div>
            <Link
              href="/contact?intent=integration"
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ background: 'var(--color-brand)' }}
            >
              Request an integration
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
