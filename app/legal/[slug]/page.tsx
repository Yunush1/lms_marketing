import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { LEGAL_DOCS } from '@/data/legal';

interface Params {
  slug: string;
}

export const revalidate = 86400;

export function generateStaticParams(): Params[] {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return { title: 'Document not found — EduSphere' };
  return buildPageMetadata({
    slug: `legal/${doc.slug}`,
    title: doc.title,
    keywords: `${doc.title}, EduSphere, school management software, legal`,
    description: doc.intro.slice(0, 160),
    path: `/legal/${doc.slug}`,
  });
}

export default async function LegalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return notFound();

  return (
    <div className="py-16 pb-20">
      <div className="max-w-[860px] mx-auto px-5">
        <div className="text-[13px] text-slate-500">Last updated · {doc.effective}</div>
        <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold text-slate-900 mt-1.5 mb-4">
          {doc.title}
        </h1>
        <p className="text-slate-700 text-base leading-loose">{doc.intro}</p>

        <div className="mt-8 flex flex-col gap-6">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[19px] font-bold text-slate-900 mb-2.5">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="text-slate-700 text-[15px] leading-loose mb-2.5">{p}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 px-4 py-3 bg-slate-50 rounded-[10px] text-[13px] text-slate-600">
          Questions? Email{' '}
          <a href="mailto:privacy@edusphere.app" className="underline" style={{ color: 'var(--color-brand)' }}>
            privacy@edusphere.app
          </a>{' '}
          and we&apos;ll respond within one business day.
        </div>

        <div className="mt-6 flex gap-4 flex-wrap text-[13px]">
          <Link href="/legal/terms" className="hover:underline">Terms</Link>
          <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
          <Link href="/legal/dpa" className="hover:underline">DPA</Link>
          <Link href="/legal/cookies" className="hover:underline">Cookies</Link>
        </div>
      </div>
    </div>
  );
}
