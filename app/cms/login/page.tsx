import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCmsUser } from '@/lib/auth-server';
import { CmsLoginForm } from './CmsLoginForm';

export const metadata: Metadata = {
  title: 'CMS Sign in · EduSphere',
  robots: { index: false, follow: false },
};

/**
 * Sign-in page for the marketing CMS. Distinct visual treatment from the
 * school-admin login so editors immediately know they're in the right
 * place. Mounts outside the (app) route group, so the auth gate doesn't
 * fire for the login route itself.
 */
export default async function CmsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  // If they're already a CMS user, skip the form.
  const existing = await getCmsUser();
  if (existing) redirect('/cms');

  const { next, error } = await searchParams;
  // Default the post-login destination to /cms unless they were bounced
  // from a deeper page by the auth guard.
  const safeNext = next?.startsWith('/cms') ? next : '/cms';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: '40px 36px',
            width: '100%',
            maxWidth: 420,
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-block',
              fontWeight: 800,
              fontSize: 18,
              color: '#4f46e5',
              textDecoration: 'none',
            }}
          >
            EduSphere
          </Link>
          <div
            style={{
              display: 'inline-block',
              marginLeft: 8,
              padding: '2px 8px',
              background: '#eef2ff',
              color: '#4f46e5',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 999,
              letterSpacing: 0.5,
              verticalAlign: 'middle',
            }}
          >
            CMS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '24px 0 6px' }}>
            Sign in to the CMS
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
            Marketing-site content authors only. School admins, sign in via the{' '}
            <Link href="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>
              regular sign-in
            </Link>
            .
          </p>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error === 'not_cms'
                ? "Your account doesn't have CMS access. Ask an admin to grant you a cms_* role."
                : error}
            </div>
          )}

          <CmsLoginForm nextPath={safeNext} />

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #f1f5f9',
              fontSize: 12,
              color: '#94a3b8',
              textAlign: 'center',
            }}
          >
            Protected by industry-standard encryption. Sessions expire automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
