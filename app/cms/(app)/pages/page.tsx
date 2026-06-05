import type { Metadata } from 'next';
import Link from 'next/link';
import { Space } from 'antd';
import { cmsAuthedGet } from '@/lib/auth-server';
import { NewPageButton } from '@/components/cms/NewPageButton';
import { SyncSeedButton } from '@/components/cms/SyncSeedButton';
import { StatusPill } from '@/components/cms/StatusPill';
import type { MarketingPage } from '@/lib/types';

// Critical: this page is dynamic — without this directive Next.js can
// cache the empty server-render between requests, leaving editors with
// a blank dashboard even after they've created rows.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Pages · EduSphere CMS',
  robots: { index: false, follow: false },
};

/** Same forgiving extractor used elsewhere — survives any unwrap drift
 *  between the proxy + backend by accepting the array at the top level
 *  OR under a `data` key (with or without an outer NestJS envelope). */
function extractPages(raw: unknown): MarketingPage[] {
  if (Array.isArray(raw)) return raw as MarketingPage[];
  if (raw && typeof raw === 'object') {
    const r = raw as { data?: unknown };
    if (Array.isArray(r.data)) return r.data as MarketingPage[];
    if (r.data && typeof r.data === 'object') {
      const inner = (r.data as { data?: unknown }).data;
      if (Array.isArray(inner)) return inner as MarketingPage[];
    }
  }
  return [];
}

/**
 * Marketing-page CRUD list. Phase 1 ships read-only — table of every
 * marketing_pages row with slug / title / status / updated-at, and an
 * "Open editor" CTA per row that links to the existing SPA admin until
 * the block editor lands in Phase 2.
 *
 * Once the block editor is in place this page becomes the new home for
 * create / edit / publish flows and the SPA link is removed.
 */
export default async function CmsPagesIndex() {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';
  // The backend list endpoint is gated to SUPER_ADMIN / DISTRICT_ADMIN /
  // cms_*. If the call fails (network, 401, server down) we render an
  // empty table — but flag it as a load failure so the editor knows the
  // empty state isn't necessarily an empty database.
  const response = await cmsAuthedGet<unknown>('/marketing/pages/admin/all?limit=200');
  const pages = extractPages(response);
  const loadFailed = response === null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/*
        Responsive header — actions wrap below the title on narrow
        screens. Buttons grow to fill the row so they're tap-friendly.
      */}
      <style>{`
        .cms-pages-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .cms-pages-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .cms-pages-actions {
            width: 100%;
          }
          .cms-pages-actions > button,
          .cms-pages-actions > span,
          .cms-pages-actions > a {
            flex: 1;
          }
        }
        @media (min-width: 769px) {
          .cms-pages-cards { display: none; }
        }
        @media (max-width: 768px) {
          .cms-pages-table { display: none; }
        }
      `}</style>
      <div className="cms-pages-header">
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            Marketing pages
          </h1>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            {pages.length} page{pages.length === 1 ? '' : 's'} in the CMS. Tap a row to
            edit, or start a new one.
          </div>
        </div>
        <div className="cms-pages-actions">
          <SyncSeedButton />
          <NewPageButton />
          <a
            href={`${APP_URL}/marketing-pages`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#64748b',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Legacy admin →
          </a>
        </div>
      </div>

      {pages.length === 0 ? (
        <EmptyState loadFailed={loadFailed} />
      ) : (
        <>
          {/* Desktop / tablet — full table */}
          <div
            className="cms-pages-table"
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <Th>Page</Th>
                  <Th>Slug</Th>
                  <Th>Status</Th>
                  <Th>Updated</Th>
                  <Th align="right">Public URL</Th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <Td>
                      <Link
                        href={`/cms/pages/${p.id}`}
                        style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}
                      >
                        {p.title}
                      </Link>
                    </Td>
                    <Td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                        /{p.slug}
                      </code>
                    </Td>
                    <Td>
                      <StatusPill status={p.status ?? (p.isPublished ? 'published' : 'draft')} />
                    </Td>
                    <Td>
                      <span style={{ color: '#475569', fontSize: 13 }}>
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                      </span>
                    </Td>
                    <Td align="right">
                      <Space>
                        <Link
                          href={`/p/${p.slug}`}
                          target="_blank"
                          style={{ color: '#64748b', fontSize: 13 }}
                        >
                          View
                        </Link>
                        <Link
                          href={`/cms/pages/${p.id}`}
                          style={{ color: '#4f46e5', fontSize: 13, fontWeight: 600 }}
                        >
                          Edit →
                        </Link>
                      </Space>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile — card list. Title is the edit link (primary tap
              target); View + Edit ride in the footer as sibling links.
              The card stays a plain div so we don't nest <a> tags or
              hand an onClick from this server component into next/link
              (Next 15 rightly rejects both). */}
          <div
            className="cms-pages-cards"
            style={{ display: 'grid', gap: 10 }}
          >
            {pages.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '14px 14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Link
                      href={`/cms/pages/${p.id}`}
                      style={{
                        display: 'block',
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: 15,
                        marginBottom: 4,
                        textDecoration: 'none',
                      }}
                    >
                      {p.title}
                    </Link>
                    <div
                      style={{
                        color: '#64748b',
                        fontSize: 12,
                        wordBreak: 'break-all',
                      }}
                    >
                      /{p.slug}
                    </div>
                  </div>
                  <StatusPill status={p.status ?? (p.isPublished ? 'published' : 'draft')} />
                </div>
                <div
                  style={{
                    marginTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: '#94a3b8',
                    fontSize: 12,
                  }}
                >
                  <span>
                    {p.updatedAt
                      ? `Updated ${new Date(p.updatedAt).toLocaleDateString()}`
                      : '—'}
                  </span>
                  <span style={{ display: 'flex', gap: 12 }}>
                    <Link href={`/p/${p.slug}`} target="_blank" style={{ color: '#64748b' }}>
                      View
                    </Link>
                    <Link
                      href={`/cms/pages/${p.id}`}
                      style={{ color: '#4f46e5', fontWeight: 600 }}
                    >
                      Edit →
                    </Link>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ loadFailed }: { loadFailed: boolean }) {
  return (
    <div
      style={{
        background: '#fff',
        border: loadFailed ? '1px solid #fca5a5' : '1px dashed #cbd5e1',
        borderRadius: 12,
        padding: '60px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: loadFailed ? '#991b1b' : '#0f172a' }}>
        {loadFailed ? "Couldn't load the page list" : 'No CMS rows yet'}
      </div>
      <div
        style={{
          color: '#64748b',
          fontSize: 14,
          marginTop: 8,
          lineHeight: 1.7,
          maxWidth: 520,
          margin: '8px auto 0',
        }}
      >
        {loadFailed ? (
          <>
            The backend either returned an error or your session is missing the
            required CMS role. Try refreshing the page, signing in again, or
            checking the backend logs.
          </>
        ) : (
          <>
            Every public page falls back to the bundled seed until a row is
            created. Click <strong>Sync seed pages</strong> to import every
            standard slug (home, pricing, about, …) as a draft you can edit,
            or create a brand-new page with <strong>New page</strong>.
          </>
        )}
      </div>
    </div>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '12px 16px',
        color: '#64748b',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.04,
        fontWeight: 700,
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return <td style={{ padding: '12px 16px', textAlign: align }}>{children}</td>;
}
