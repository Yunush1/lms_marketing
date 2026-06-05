import type { Metadata } from 'next';
import { TemplateGallery } from '@/components/cms/templates/TemplateGallery';

export const metadata: Metadata = {
  title: 'Templates · EduSphere CMS',
  robots: { index: false, follow: false },
};

export default function CmsTemplatesPage() {
  return <TemplateGallery />;
}
