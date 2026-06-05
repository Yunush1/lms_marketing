/**
 * /api/cms/media/:id — PATCH (alt / folder / focal point), DELETE.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth-cookies';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

async function getToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIES.ACCESS)?.value ?? null;
}

/** Same envelope-aware unwrap as the list route — protects callers
 *  from accidentally double-stripping when the inner payload itself has
 *  a `data` key. */
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  try {
    const upstream = await fetch(`${BASE}/media/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'Update failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/media/:id] PATCH upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const upstream = await fetch(`${BASE}/media/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!upstream.ok) {
      const envelope = await upstream.json().catch(() => ({}));
      return NextResponse.json(
        { message: envelope?.message ?? 'Delete failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[cms/media/:id] DELETE upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
