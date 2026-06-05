/**
 * PATCH /api/cms/pages/:id/status — set editorial state.
 * Forwards the CMS access cookie as a Bearer token so the role guard
 * runs against the real user.
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

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body?.status) {
    return NextResponse.json({ message: 'status is required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${BASE}/marketing/pages/${id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'Status change failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/pages/:id/status] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
