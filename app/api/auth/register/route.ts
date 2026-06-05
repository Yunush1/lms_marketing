/**
 * POST /api/auth/register
 *
 * Proxies the school-admin registration to the backend, then sets auth
 * cookies on the response so the user is signed in immediately.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { setAuthCookies } from '@/lib/auth-cookies';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

interface RegisterBody {
  schoolName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  planId?: string;
}

export async function POST(req: NextRequest) {
  let body: RegisterBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const required: (keyof RegisterBody)[] = [
    'schoolName',
    'firstName',
    'lastName',
    'email',
    'password',
    'planId',
  ];
  for (const k of required) {
    if (!body[k]) {
      return NextResponse.json(
        { message: `Missing required field: ${k}` },
        { status: 400 },
      );
    }
  }

  try {
    const upstream = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const envelope = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      // Backend uses class-validator; messages can be arrays.
      const raw = envelope?.message;
      const message = Array.isArray(raw) ? raw.join('; ') : raw || 'Could not create account';
      return NextResponse.json({ message }, { status: upstream.status });
    }

    // TransformInterceptor wraps every response: { success, statusCode, message, data, ... }
    const payload = envelope?.data ?? envelope;
    const accessToken = payload?.accessToken ?? payload?.access_token;
    const refreshToken = payload?.refreshToken ?? payload?.refresh_token;
    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { message: 'Register response missing tokens' },
        { status: 502 },
      );
    }

    const res = NextResponse.json({ user: payload.user ?? null });
    setAuthCookies(res, { accessToken, refreshToken });
    return res;
  } catch (err) {
    console.error('[auth/register] upstream error', err);
    return NextResponse.json(
      { message: 'Could not reach auth server. Try again in a moment.' },
      { status: 502 },
    );
  }
}
