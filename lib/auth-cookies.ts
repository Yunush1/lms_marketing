/**
 * HttpOnly cookie helpers for storing the auth tokens issued by the
 * backend `/auth/login` and `/auth/register` endpoints.
 *
 * Cookies are httpOnly so client JS can't read them (XSS-resistant). The
 * Next.js route handlers in `app/api/auth/*` set/clear them; server
 * components read them via `cookies()` from `next/headers`.
 */
import type { NextResponse } from 'next/server';

const ACCESS_COOKIE = 'es_access';
const REFRESH_COOKIE = 'es_refresh';

// Backend access tokens default to 15m; refresh to 7d.
const ACCESS_MAX_AGE = 60 * 60; // 1h — cushion for clock skew
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export const AUTH_COOKIES = {
  ACCESS: ACCESS_COOKIE,
  REFRESH: REFRESH_COOKIE,
};

const isProd = process.env.NODE_ENV === 'production';

interface SetTokenOptions {
  accessToken: string;
  refreshToken: string;
}

export function setAuthCookies(res: NextResponse, { accessToken, refreshToken }: SetTokenOptions) {
  res.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
