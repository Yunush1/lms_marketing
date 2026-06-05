import { notFound, redirect } from 'next/navigation';
import { getCmsUser } from '@/lib/auth-server';
import { BlockRenderer } from '@/components/cms/render/BlockRenderer';
import { findTemplate } from '@/lib/page-templates';

/**
 * Real-render preview of a CMS template. Mounted OUTSIDE the (app)
 * route group so the CMS sidebar / topbar don't appear inside the
 * iframe — visitors see the template the way real public visitors will.
 *
 * Still auth-gated: we call `getCmsUser()` server-side and bounce
 * non-CMS visitors back to /cms/login. The gallery loads this route
 * inside an iframe; same-origin cookies travel automatically.
 */
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Template preview · EduSphere CMS',
  robots: { index: false, follow: false },
};

export default async function CmsTemplatePreview({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const user = await getCmsUser();
  if (!user) redirect('/cms/login?next=/cms/templates');

  const { key } = await params;
  const template = findTemplate(key);
  if (!template) notFound();

  return (
    <div>
      {/*
        The marketing site's root layout always wraps every route with
        the public Header / Footer / CookieBanner. Inside the gallery
        iframe those are pure noise — hide them while this page is
        mounted so the visitor sees just the template content.
      */}
      <style>{`
        body > * > header,
        body > * > footer,
        body > * > div[role='dialog'][data-cookie-banner='true'] {
          display: none !important;
        }
        body { background: #fff; }
      `}</style>
      <PreviewBanner label={template.label} />
      <BlockRenderer blocks={template.build()} />
    </div>
  );
}

function PreviewBanner({ label }: { label: string }) {
  return (
    <div
      style={{
        background: '#0f172a',
        color: '#fff',
        padding: '8px 16px',
        fontSize: 12,
        fontWeight: 600,
        textAlign: 'center',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}
    >
      Template preview · {label} · this is not a published page
    </div>
  );
}
