/**
 * POST /api/cms/pages/:id/revisions/:revId/restore — restore the page to
 * the snapshot stored in revision `:revId`. The backend snapshots the
 * current state first, so this is undoable from the same History panel.
 */
import { NextResponse } from 'next/server';
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

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string; revId: string }> },
) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const { id, revId } = await ctx.params;
  try {
    const upstream = await fetch(
      `${BASE}/marketing/pages/${id}/revisions/${revId}/restore`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
    );
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'Restore failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/pages/:id/revisions/:revId/restore] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
