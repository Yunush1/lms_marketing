/**
 * POST /api/auth/login
 *
 * Thin proxy in front of the NestJS `POST /auth/login`. We do the call
 * server-side so we can set httpOnly cookies on the response — client JS
 * never touches the raw tokens.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { setAuthCookies } from '@/lib/auth-cookies';

const BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const envelope = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const raw = envelope?.message;
      const message = Array.isArray(raw) ? raw.join('; ') : raw || 'Invalid email or password';
      return NextResponse.json({ message }, { status: upstream.status });
    }

    // Backend wraps every response: { success, statusCode, message, data, timestamp }.
    // Some auth payloads are also returned bare in dev, so accept either.
    const payload = envelope?.data ?? envelope;
    const accessToken = payload?.accessToken ?? payload?.access_token;
    const refreshToken = payload?.refreshToken ?? payload?.refresh_token;
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { message: 'Auth response missing tokens' },
        { status: 502 },
      );
    }

    const res = NextResponse.json({ user: payload.user ?? null });
    setAuthCookies(res, { accessToken, refreshToken });
    return res;
  } catch (err) {
    console.error('[auth/login] upstream error', err);
    return NextResponse.json(
      { message: 'Could not reach auth server. Try again in a moment.' },
      { status: 502 },
    );
  }
}
