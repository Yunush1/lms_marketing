/**
 * Server-only helpers — read the auth cookie from the incoming request and
 * make authenticated calls to the NestJS backend. Returns `null` on any
 * failure (401, network, unparseable JSON) so callers can render the
 * unauthed state instead of crashing.
 *
 * Do NOT import this from client components. The `cookies()` API only
 * works inside server components, layouts, and route handlers.
 */
import { cookies } from 'next/headers';
import { AUTH_COOKIES } from './auth-cookies';
import type {
  AuthUser,
  MySubscription,
  SchoolDetails,
  SchoolStats,
} from './types';

const BASE =
  process.env.NEXT_PUBLIC_API_URL_PUBLIC ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

interface FetchOpts {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  cache?: RequestCache;
}

/**
 * Authenticated fetch that injects the access cookie as a Bearer token.
 * Unwraps the backend's `{ success, data, ... }` envelope so callers get
 * the raw payload.
 */
async function authedFetch<T>(path: string, opts: FetchOpts = {}): Promise<T | null> {
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIES.ACCESS)?.value;
  if (!token) return null;
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: opts.cache ?? 'no-store',
    });
    if (!res.ok) return null;
    const envelope = await res.json();
    if (envelope && typeof envelope === 'object' && 'data' in envelope && 'success' in envelope) {
      return (envelope as { data: T }).data ?? null;
    }
    return envelope as T;
  } catch (err) {
    console.error('[auth-server] fetch failed', url, err);
    return null;
  }
}

/** Returns the current user, or null if the cookie is missing / expired. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return authedFetch<AuthUser>('/auth/me');
}

/** Returns the user's school, or null if they don't have one yet. */
export async function getMySchool(schoolId?: string | null): Promise<SchoolDetails | null> {
  if (!schoolId) return null;
  return authedFetch<SchoolDetails>(`/schools/${schoolId}`);
}

/** Returns the school's usage stats (counts of students/teachers/etc.). */
export async function getMySchoolStats(schoolId?: string | null): Promise<SchoolStats | null> {
  if (!schoolId) return null;
  return authedFetch<SchoolStats>(`/schools/${schoolId}/stats`);
}

/** Returns the current subscription. */
export async function getMySubscription(): Promise<MySubscription | null> {
  return authedFetch<MySubscription>('/subscriptions/me');
}

/** Convenience: true if an auth cookie is present (does not validate it). */
export async function hasAuthCookie(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(AUTH_COOKIES.ACCESS)?.value);
}

/**
 * Returns the current user IF they have any CMS-capable role (cms_* OR
 * super_admin / district_admin, both of which inherit CMS access for
 * back-compat). Otherwise null — caller redirects to /cms/login.
 *
 * Used by app/cms/(app)/layout.tsx to gate the entire CMS surface in one
 * place. Page components can also call this to make publish/draft UI
 * decisions based on role.
 */
export async function getCmsUser(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = user.role;
  const cmsRoles: AuthUser['role'][] = [
    'super_admin',
    'district_admin',
    'cms_admin',
    'cms_editor',
    'cms_author',
    'cms_contributor',
  ];
  return cmsRoles.includes(role) ? user : null;
}

/**
 * Authenticated GET that other CMS pages can use to call any backend
 * endpoint with the current user's token. Mirrors authedFetch above but
 * is exported because page components (server) need it.
 */
export async function cmsAuthedGet<T>(path: string): Promise<T | null> {
  return authedFetch<T>(path);
}
