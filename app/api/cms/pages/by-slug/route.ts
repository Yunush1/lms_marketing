/**
 * GET /api/cms/pages/by-slug?slug=<slug> — resolves a marketing_pages
 * row id by its slug. Used by the navigation editor as a fallback when
 * a 409 error body doesn't carry `existingId` (NestJS shapes vary), so
 * the editor can recover instead of fighting the user with a toast.
 *
 * Returns `{ id, slug, status }` on a hit, `{ id: null }` when no row
 * has that slug, and 401 if no CMS cookie.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth-cookies';
import { BASE } from '@/lib/api';

interface PageListRow {
  id: string;
  slug: string;
  status?: string;
}

/** Pull the array out of any plausible response shape. */
function extractRows(raw: unknown): PageListRow[] {
  if (Array.isArray(raw)) return raw as PageListRow[];
  if (raw && typeof raw === 'object') {
    const r = raw as { data?: unknown };
    if (Array.isArray(r.data)) return r.data as PageListRow[];
    if (r.data && typeof r.data === 'object') {
      const inner = (r.data as { data?: unknown }).data;
      if (Array.isArray(inner)) return inner as PageListRow[];
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get('slug')?.trim();
  if (!slug) {
    return NextResponse.json({ message: 'slug is required' }, { status: 400 });
  }

  try {
    // Search hits both slug + title with ILIKE — fine for our case
    // because the reserved navigation slug is unique enough that we
    // won't get false positives. We strict-match on slug in JS just to
    // be safe.
    const upstream = await fetch(
      `${BASE}/marketing/pages/admin/all?search=${encodeURIComponent(slug)}&limit=200`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    if (!upstream.ok) {
      return NextResponse.json(
        { id: null, message: `Upstream ${upstream.status}` },
        { status: upstream.status },
      );
    }
    const envelope = await upstream.json().catch(() => ({}));
    const rows = extractRows(envelope);
    const match = rows.find((r) => r.slug === slug) ?? null;
    return NextResponse.json(match ? { id: match.id, slug: match.slug, status: match.status } : { id: null });
  } catch (err) {
    console.error('[cms/pages/by-slug] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
