'use client';

import { useMutation } from '@tanstack/react-query';
import { App as AntApp } from 'antd';
import { leadsApi } from '@/lib/api';
import type { LeadPayload } from '@/lib/types';

/**
 * Client-side mutation hook for the Contact form + Blog newsletter signup.
 * Mirrors the SPA's `useSubmitLead` so the React code is identical.
 */
export function useSubmitLead() {
  const { message } = AntApp.useApp();
  return useMutation({
    mutationFn: (data: LeadPayload) => leadsApi.submit(data),
    onSuccess: (res) =>
      message.success(res?.message ?? 'Thanks! Our team will reach out shortly.'),
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: unknown }).message)
          : 'Could not submit — please try again.';
      message.error(msg);
    },
  });
}
