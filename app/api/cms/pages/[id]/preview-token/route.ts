/**
 * POST /api/cms/pages/:id/preview-token — ask the backend to mint a
 * short-lived JWT the public renderer can use to fetch a draft. The
 * editor opens `/p/[slug]?preview=<token>` in a new tab.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth-cookies';
import { BASE } from '@/lib/api';

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

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const { id } = await ctx.params;

  try {
    const upstream = await fetch(`${BASE}/marketing/pages/${id}/preview-token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'Could not mint preview token' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/pages/:id/preview-token] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
