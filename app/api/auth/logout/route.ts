/**
 * POST /api/auth/logout — clears the auth cookies and (best-effort)
 * blacklists the access token on the backend.
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIES, clearAuthCookies } from '@/lib/auth-cookies';
import { BASE } from '@/lib/api';

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
