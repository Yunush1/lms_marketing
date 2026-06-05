'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { App as AntApp } from 'antd';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '@/lib/types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}

interface AuthResponse {
  user: AuthUser | null;
}

/**
 * Sign in via the Next.js `/api/auth/login` route handler. The proxy sets
 * the auth cookies, so on success we just navigate to the destination —
 * the server component on /me will read the cookie and render the
 * authenticated view.
 */
export function useLogin() {
  const router = useRouter();
  const { message } = AntApp.useApp();
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      postJson<AuthResponse>('/api/auth/login', payload),
    onSuccess: (res, _vars, _ctx) => {
      message.success(`Welcome back${res.user?.firstName ? `, ${res.user.firstName}` : ''}!`);
      router.push('/me');
      router.refresh();
    },
    onError: (err: Error) => message.error(err.message),
  });
}

export function useRegister() {
  const router = useRouter();
  const { message } = AntApp.useApp();
  return useMutation({
    mutationFn: (payload: RegisterPayload) =>
      postJson<AuthResponse>('/api/auth/register', payload),
    onSuccess: (res) => {
      message.success(
        `Welcome to EduSphere${res.user?.firstName ? `, ${res.user.firstName}` : ''}! Your trial has started.`,
      );
      router.push('/me');
      router.refresh();
    },
    onError: (err: Error) => message.error(err.message),
  });
}

export function useLogout() {
  const router = useRouter();
  const { message } = AntApp.useApp();
  return useMutation({
    mutationFn: () => postJson<{ ok: true }>('/api/auth/logout', {}),
    onSuccess: () => {
      message.success('Signed out.');
      router.push('/');
      router.refresh();
    },
    onError: (err: Error) => message.error(err.message),
  });
}
