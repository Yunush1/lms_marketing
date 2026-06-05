/**
 * GET /api/auth/me — returns the current user, or 401. Reads the access
 * cookie server-side and proxies to the backend so client JS never sees
 * the raw token.
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
