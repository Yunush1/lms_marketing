import type { Metadata } from 'next';
import Link from 'next/link';
import { getCmsUser } from '@/lib/auth-server';

export const metadata: Metadata = {
  title: 'Dashboard · EduSphere CMS',
  robots: { index: false, follow: false },
};

/**
 * CMS dashboard — landing page after sign-in. Kept intentionally light in
 * Phase 1: a welcome card, a few quick-jump tiles, and a roadmap status
 * panel so editors know which sections are still placeholders.
 *
 * Phase 2 will replace the quick-jump tiles with "Recent activity" and
 * "Drafts assigned to you" panels once revisions/drafts land.
 */
export default async function CmsDashboardPage() {
  const user = await getCmsUser();
  if (!user) return null; // layout already redirected, but TS needs the guard

  const firstName = user.firstName || user.email.split('@')[0];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
          Welcome back, {firstName}.
        </h1>
        <p style={{ color: '#475569', marginTop: 8, lineHeight: 1.7 }}>
          You're signed in as <strong>{user.role.replace('_', ' ')}</strong>.
          Pick a section in the sidebar to start editing — Pages are live in
          Phase 1; Posts, Docs, Media and Settings land in later phases.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          // `min(260px, 100%)` lets a single card sit at full width on
          // narrow screens instead of getting clipped by the 260px floor.
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
          gap: 16,
        }}
      >
        <QuickCard
          title="Marketing pages"
          subtitle="Home, Pricing, About, Contact and more"
          href="/cms/pages"
          cta="Manage pages"
        />
        <QuickCard
          title="View the public site"
          subtitle="See your changes the way visitors do"
          href="/"
          cta="Open site"
          external
        />
        <QuickCard
          title="Phase 2 — Block editor"
          subtitle="Visual editor coming next. Today: structured forms."
          disabled
        />
        <QuickCard
          title="Phase 3 — Media library"
          subtitle="Upload + reuse images across pages."
          disabled
        />
      </div>
    </div>
  );
}

interface QuickCardProps {
  title: string;
  subtitle: string;
  href?: string;
  cta?: string;
  external?: boolean;
  disabled?: boolean;
}

function QuickCard({ title, subtitle, href, cta, external, disabled }: QuickCardProps) {
  const body = (
    <div
      style={{
        background: disabled ? '#f1f5f9' : '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 18,
        height: '100%',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <div style={{ fontWeight: 700, color: '#0f172a' }}>{title}</div>
      <div style={{ color: '#64748b', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
        {subtitle}
      </div>
      {cta && (
        <div style={{ marginTop: 14, color: '#4f46e5', fontWeight: 600, fontSize: 13 }}>
          {cta} →
        </div>
      )}
    </div>
  );
  if (disabled || !href) return body;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
      {body}
    </a>
  ) : (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {body}
    </Link>
  );
}
