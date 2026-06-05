/**
 * /api/cms/media — GET (list, paginated) and POST (multipart upload).
 * Forwards the visitor's CMS access cookie as a Bearer token so the
 * backend role guard runs against the real user.
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

/**
 * Only unwrap the NestJS envelope when it looks like one — i.e. carries
 * both `success` and `data`. Otherwise pass the response through as-is.
 *
 * The naive `envelope?.data ?? envelope` collapsed responses whose first
 * field was *also* called `data` (`{ data: [], pagination: {} }` from
 * `service.list()`), so the consumer ended up with the inner array
 * directly instead of the list-shaped object it expected.
 */
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

export async function GET(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
  const qs = req.nextUrl.searchParams.toString();
  try {
    const upstream = await fetch(`${BASE}/media${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
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
    console.error('[cms/media] GET upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}

/**
 * Forward multipart/form-data straight through. NextRequest exposes the
 * raw body as a stream — we just stream it to the backend with the same
 * Content-Type header, no re-parsing needed.
 */
export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const qs = req.nextUrl.searchParams.toString();
  const contentType = req.headers.get('content-type');
  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    return NextResponse.json(
      { message: 'Expected multipart/form-data' },
      { status: 400 },
    );
  }

  // We need to re-build the form here because we can't directly forward
  // the raw body to fetch() in Node — fetch needs a parsed body or a
  // proper stream. Re-creating from formData() is fast for files < 20 MB.
  const incoming = await req.formData();
  const out = new FormData();
  for (const [k, v] of incoming.entries()) out.append(k, v);

  try {
    const upstream = await fetch(`${BASE}/media${qs ? `?${qs}` : ''}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: out,
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: string };
      return NextResponse.json(
        { message: e?.message ?? 'Upload failed' },
        { status: upstream.status },
      );
    }
    return NextResponse.json(unwrap(envelope));
  } catch (err) {
    console.error('[cms/media] POST upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
