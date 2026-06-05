import type { Metadata } from 'next';
import { ComingSoon } from '@/components/cms/ComingSoon';

export const metadata: Metadata = {
  title: 'Docs · EduSphere CMS',
  robots: { index: false, follow: false },
};

export default function CmsDocsPage() {
  return (
    <ComingSoon
      title="Docs"
      subtitle="Documentation sections shown on /docs."
      phase="Phase 6"
      detail="Docs share the same authoring stack as Posts. They land together once revisions + media are in place."
    />
  );
}
