import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { marketingApi } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { PRODUCTS as PRODUCTS_FALLBACK } from '@/data/segments';
import type { SolutionContent } from '@/lib/types';
import { SegmentPageView } from '@/components/SegmentPageView';
import { TrackPageview } from '@/components/TrackPageview';

interface Params {
  slug: string;
}

export const revalidate = 600;

export function generateStaticParams(): Params[] {
  return Object.keys(PRODUCTS_FALLBACK).map((slug) => ({ slug }));
}

async function loadProduct(slug: string): Promise<SolutionContent | null> {
  const live = await marketingApi.getProduct(slug);
  if (live?.slug) return live;
  const fallback = PRODUCTS_FALLBACK[slug];
  return fallback
    ? { ...fallback, capabilities: fallback.capabilities ?? [] } as SolutionContent
    : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadProduct(slug);
  if (!data) return { title: 'Product not found — EduSphere' };
  return buildPageMetadata({
    slug: `product/${data.slug}`,
    title: data.title,
    description: data.subtitle,
    path: `/product/${data.slug}`,
  });
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const data = await loadProduct(slug);
  if (!data) return notFound();
  return (
    <>
      <TrackPageview event="viewed_product" metadata={{ slug }} />
      <SegmentPageView data={data} />
    </>
  );
}
