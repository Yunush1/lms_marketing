'use client';

import { useEffect } from 'react';
import { logEvent } from '@/lib/audit';

/**
 * Drop into a server component to fire an analytics event on mount.
 * Equivalent to the SPA's `useTrackPageview` hook.
 */
export function TrackPageview({
  event,
  metadata,
}: {
  event: string;
  metadata?: Record<string, unknown>;
}) {
  useEffect(() => {
    logEvent({ event, metadata });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
