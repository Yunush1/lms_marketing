/**
 * POST /api/cms/pages — proxy that lets the CMS create a new
 * marketing_pages row. The backend endpoint is auth-gated; we forward
 * the user's access cookie as a Bearer token so the role check works.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/lib/auth-cookies';
import { BASE } from '@/lib/api';

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });

  try {
    const upstream = await fetch(`${BASE}/marketing/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // The NestJS error body might be `{ message: '...' }` or a richer
      // shape (Nest's ConflictException can carry `{ message, existingId,
      // statusCode, error }`). Preserve any extra fields so the client
      // can act on them — e.g. routing to an existing row on 409.
      const errBody =
        envelope && typeof envelope === 'object'
          ? (envelope as Record<string, unknown>)
          : {};
      const raw = (errBody as { message?: unknown }).message;
      const msg = Array.isArray(raw) ? raw.join('; ') : (raw as string) || 'Create failed';
      return NextResponse.json({ ...errBody, message: msg }, { status: upstream.status });
    }
    // Strip the NestJS envelope only when both `success` and `data` are
    // present (matches authedFetch's contract elsewhere).
    const ok =
      envelope &&
      typeof envelope === 'object' &&
      'success' in envelope &&
      'data' in envelope
        ? (envelope as { data: unknown }).data
        : envelope;
    return NextResponse.json(ok);
  } catch (err) {
    console.error('[cms/pages] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
