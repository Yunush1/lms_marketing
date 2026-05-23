'use client';

/**
 * Lightweight client-side analytics stub. Matches the SPA's `lib/audit.ts`
 * surface so ports of public pages keep working without modification.
 *
 * Today this just console.logs events. Wire in Plausible / PostHog /
 * Segment by replacing the body of `logEvent`.
 */
import { useEffect } from 'react';

export interface AuditEvent {
  event: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export function logEvent(evt: AuditEvent) {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line no-console
  console.debug('[audit]', evt.event, evt.entityId ?? '', evt.metadata ?? {});
}

/** Fires once per mount; ignored on the server. */
export function useTrackPageview(event: string, metadata?: Record<string, unknown>) {
  useEffect(() => {
    logEvent({ event, metadata });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
