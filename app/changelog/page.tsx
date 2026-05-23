import type { Metadata } from 'next';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { CHANGELOG as CHANGELOG_FALLBACK } from '@/data/segments';

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'changelog',
    title: 'Changelog',
    description:
      'What we shipped recently — new features, improvements, and fixes across the EduSphere platform.',
    path: '/changelog',
  });
}

const kindStyle: Record<string, string> = {
  New: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Improved: 'bg-purple-50 text-purple-700 border-purple-200',
  Fixed: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default async function ChangelogPage() {
  const entries = (await marketingApi.listChangelog()) ?? CHANGELOG_FALLBACK;

  return (
    <>
      <section className="py-16 pb-8 text-center">
        <div className="max-w-[820px] mx-auto px-5">
          <span className="inline-block px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[13px] font-medium">Changelog</span>
          <h1 className="text-[clamp(28px,4vw,42px)] font-extrabold text-slate-900 mt-3 mb-2">
            What&apos;s new in EduSphere
          </h1>
          <p className="text-slate-600 text-[17px] mt-2">
            Recent releases, in reverse-chronological order.
          </p>
        </div>
      </section>

      <section className="py-5 pb-20">
        <div className="max-w-[820px] mx-auto px-5">
          {entries.map((c) => (
            <div key={`${c.date}-${c.title}`} className="bg-white rounded-[14px] p-6 border border-slate-100 mb-4">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${kindStyle[c.kind] ?? kindStyle.New}`}>{c.kind}</span>
                <div className="text-xs text-slate-500">{new Date(c.date).toLocaleDateString()}</div>
              </div>
              <div className="font-bold text-[17px] text-slate-900">{c.title}</div>
              <div className="text-slate-600 text-sm leading-relaxed mt-1.5">{c.body}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
