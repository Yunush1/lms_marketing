import type { Metadata } from 'next';
import { ComingSoon } from '@/components/cms/ComingSoon';

export const metadata: Metadata = {
  title: 'Settings · EduSphere CMS',
  robots: { index: false, follow: false },
};

export default function CmsSettingsPage() {
  return (
    <ComingSoon
      title="Settings"
      subtitle="Site-wide content — brand, nav, footer, sales contact."
      phase="Phase 3+"
      detail="A single `site` slug row will drive the public header/footer/contact details so they're editable without a deploy. Pairs with the media library for logos."
    />
  );
}
