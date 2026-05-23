import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { DOCS } from '@/data/marketing';
import { DocsClient } from './DocsClient';

// The /docs source today is the bundled `data/marketing.ts` (the SPA's
// existing useDocs() also reads from this seed when the API is empty).
// We render the docs shell server-side; interactive search/filter is in
// the client component below.
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'docs',
    title: 'Documentation',
    description:
      'Guides for getting started with EduSphere — admin, teacher, accountant, parent.',
    path: '/docs',
  });
}

export default function DocsPage() {
  return <DocsClient docs={DOCS} />;
}
