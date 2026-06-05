import type { Metadata } from 'next';
import { MediaLibrary } from '@/components/cms/media/MediaLibrary';

export const metadata: Metadata = {
  title: 'Media · EduSphere CMS',
  robots: { index: false, follow: false },
};

export default function CmsMediaPage() {
  return <MediaLibrary />;
}
