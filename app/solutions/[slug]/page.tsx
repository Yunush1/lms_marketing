import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { SOLUTIONS as SOLUTIONS_FALLBACK } from '@/data/segments';
import type { SolutionContent } from '@/lib/types';
import { SegmentPageView } from '@/components/SegmentPageView';
import { TrackPageview } from '@/components/TrackPageview';

interface Params {
  slug: string;
}

export const revalidate = 600;

export function generateStaticParams(): Params[] {
  return Object.keys(SOLUTIONS_FALLBACK).map((slug) => ({ slug }));
}

async function loadSolution(slug: string): Promise<SolutionContent | null> {
  const live = await marketingApi.getSolution(slug);
  if (live?.slug) return live;
  const fallback = SOLUTIONS_FALLBACK[slug];
  return fallback
    ? { ...fallback, capabilities: fallback.capabilities ?? [] } as SolutionContent
    : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadSolution(slug);
  if (!data) return { title: 'Solution not found — EduSphere' };
  return buildPageMetadata({
    slug: `solutions/${data.slug}`,
    title: data.title,
    description: data.subtitle,
    path: `/solutions/${data.slug}`,
  });
}

export default async function SolutionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const data = await loadSolution(slug);
  if (!data) return notFound();
  return (
    <>
      <TrackPageview event="viewed_solution" metadata={{ slug }} />
      <SegmentPageView data={data} />
    </>
  );
}
