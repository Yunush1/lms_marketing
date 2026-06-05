import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cmsAuthedGet } from '@/lib/auth-server';
import { PageEditor } from '@/components/cms/edit/PageEditor';
import type { MarketingPage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Edit page · EduSphere CMS',
  robots: { index: false, follow: false },
};

/**
 * Edit screen for a single marketing_pages row. Server component fetches
 * the current state, then the client `PageEditor` takes over for the
 * interactive block editing.
 */
export default async function CmsPageEdit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await cmsAuthedGet<MarketingPage>(`/marketing/pages/admin/by-id/${id}`);
  if (!page) notFound();

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <Link href="/cms/pages" style={{ color: '#4f46e5', fontSize: 13, fontWeight: 600 }}>
          ← Back to pages
        </Link>
      </div>
      <PageEditor page={page} />
    </div>
  );
}
