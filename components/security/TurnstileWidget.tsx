'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Cloudflare Turnstile widget. Renders an inline challenge that
 * produces a one-time token; the parent passes the token along with
 * the form submission, and the backend verifies it before processing.
 *
 * Disabled (renders nothing) when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is
 * unset so dev environments without a key still work — the backend's
 * `TurnstileService` mirrors that behaviour.
 *
 * Usage:
 *   const [captcha, setCaptcha] = useState<string | null>(null);
 *   ...
 *   <TurnstileWidget action="lead-submit" onToken={setCaptcha} />
 *   ...
 *   fetch('/api/leads', { body: JSON.stringify({ ...form, captchaToken: captcha })})
 */

interface TurnstileGlobal {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action?: string;
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      'timeout-callback'?: () => void;
      appearance?: 'always' | 'execute' | 'interaction-only';
      theme?: 'auto' | 'light' | 'dark';
      size?: 'normal' | 'flexible' | 'compact' | 'invisible';
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Module-level dedupe so multiple widgets share one script tag. */
let scriptLoadPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-turnstile-loader="true"]',
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.setAttribute('data-turnstile-loader', 'true');
    s.addEventListener('load', () => resolve());
    s.addEventListener('error', () => reject(new Error('Turnstile script failed')));
    document.head.appendChild(s);
  });
  return scriptLoadPromise;
}

export interface TurnstileWidgetProps {
  /** Optional action label — must match the backend's expectedAction. */
  action?: string;
  /**
   * Receives the token on solve, or null when the token expires / fails.
   * Form submit handlers should re-check for a non-null value before
   * sending the request.
   */
  onToken: (token: string | null) => void;
  theme?: 'auto' | 'light' | 'dark';
}

export function TurnstileWidget({
  action,
  onToken,
  theme = 'auto',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerId = useId();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // console.log('TurnstileWidget: initializing', { siteKey, action, theme });
    if (!siteKey || !containerRef.current) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme,
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
          'timeout-callback': () => onToken(null),
        });
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* widget already torn down */
        }
        widgetIdRef.current = null;
      }
    };
    // We deliberately do NOT depend on `onToken` — re-running the
    // render call would tear down the widget on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, action, theme]);

  // If the site key isn't configured at build time, render nothing —
  // backend skips verification in matching dev mode.
  if (!siteKey) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div ref={containerRef} id={containerId} />
      {loadError && (
        <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
          Couldn&apos;t load the captcha — please reload the page. ({loadError})
        </div>
      )}
    </div>
  );
}

/** True if the site key is configured. Forms use this to decide whether
 *  to require a token before allowing submit. */
export function isTurnstileEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
}
