/**
 * GET /api/cms/pages/:id/revisions — list edit history for a page.
 * Forwards the visitor's CMS access cookie as a Bearer token so the
 * backend role guard sees the real user.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth-cookies';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

function unwrap(envelope: unknown): unknown {
  if (
    envelope &&
    typeof envelope === 'object' &&
    'success' in envelope &&
    'data' in envelope
  ) {
    return (envelope as { data: unknown }).data;
  }
  return envelope;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const { id } = await ctx.params;
  const qs = req.nextUrl.searchParams.toString();
  try {
    const upstream = await fetch(
      `${BASE}/marketing/pages/${id}/revisions${qs ? `?${qs}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    );
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'List failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/pages/:id/revisions] GET upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
