import type { Metadata } from 'next';
import { ComingSoon } from '@/components/cms/ComingSoon';

export const metadata: Metadata = {
  title: 'Posts · EduSphere CMS',
  robots: { index: false, follow: false },
};

export default function CmsPostsPage() {
  return (
    <ComingSoon
      title="Posts"
      subtitle="Blog posts authored from inside the CMS."
      phase="Phase 6"
      detail="Posts are currently created through the legacy SPA admin. They'll move here alongside Docs once the block editor, media library and revisions land."
    />
  );
}
