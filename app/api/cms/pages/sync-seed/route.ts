/**
 * POST /api/cms/pages/sync-seed — proxy for the backend bulk-import.
 * Forwards the CMS access cookie as a Bearer token.
 */
import { NextResponse } from 'next/server';
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

export async function POST() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  try {
    const upstream = await fetch(`${BASE}/marketing/pages/sync-seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'Sync failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/pages/sync-seed] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
