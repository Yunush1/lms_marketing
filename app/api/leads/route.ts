/**
 * POST /api/leads — public proxy for FormBlock submissions.
 *
 * The marketing FormRender posts here by default (an editor can also
 * point a form at a custom URL — e.g. a Zapier webhook — in which case
 * the browser hits that directly and this proxy isn't used).
 *
 * Forwarding through Next.js keeps the backend API URL out of public
 * HTML responses and gives us a stable same-origin endpoint that's
 * trivially CORS-safe for the marketing site.
 */
import { NextResponse, type NextRequest } from 'next/server';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });

  try {
    const upstream = await fetch(`${BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const envelope = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const e = envelope as { message?: unknown };
      const raw = e?.message;
      const msg = Array.isArray(raw) ? raw.join('; ') : (raw as string) || 'Submit failed';
      return NextResponse.json({ message: msg }, { status: upstream.status });
    }
    const unwrap =
      envelope &&
      typeof envelope === 'object' &&
      'success' in envelope &&
      'data' in envelope
        ? (envelope as { data: unknown }).data
        : envelope;
    return NextResponse.json(unwrap);
  } catch (err) {
    console.error('[leads] upstream error', err);
    return NextResponse.json({ message: 'Could not reach API' }, { status: 502 });
  }
}
