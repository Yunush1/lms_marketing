/**
 * POST /api/auth/logout — clears the auth cookies and (best-effort)
 * blacklists the access token on the backend.
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIES, clearAuthCookies } from '@/lib/auth-cookies';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

export async function POST() {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;

  if (token) {
    // Best-effort blacklist; if the upstream is down we still log the
    // browser out by clearing the cookies below.
    fetch(`${BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
