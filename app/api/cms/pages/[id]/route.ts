/**
 * /api/cms/pages/:id — PATCH (update fields), DELETE (remove row).
 * Forwards the CMS user's access cookie as a Bearer token so the
 * backend's role guard can see them.
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

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });

  try {
    const upstream = await fetch(`${BASE}/marketing/pages/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const raw = envelope?.message;
      const msg = Array.isArray(raw) ? raw.join('; ') : raw || 'Update failed';
      return NextResponse.json({ message: msg }, { status: upstream.status });
    }
    return NextResponse.json(envelope?.data ?? envelope);
  } catch (err) {
    console.error('[cms/pages/:id] PATCH upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const { id } = await ctx.params;
  try {
    const upstream = await fetch(`${BASE}/marketing/pages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!upstream.ok) {
      const envelope = await upstream.json().catch(() => ({}));
      const raw = envelope?.message;
      const msg = Array.isArray(raw) ? raw.join('; ') : raw || 'Delete failed';
      return NextResponse.json({ message: msg }, { status: upstream.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[cms/pages/:id] DELETE upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
