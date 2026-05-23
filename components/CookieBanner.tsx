'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { logEvent } from '@/lib/audit';

const STORAGE_KEY = 'edusphere.cookieConsent.v1';

type Consent = 'accepted' | 'rejected';

const readConsent = (): Consent | null => {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
  } catch {
    /* localStorage may be blocked — show the banner each load, that's fine */
  }
  return null;
};

const writeConsent = (v: Consent) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
};

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() == null) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (choice: Consent) => {
    writeConsent(choice);
    logEvent({ event: 'cookie_consent', metadata: { choice } });
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed left-4 right-4 bottom-4 z-[1000] max-w-[720px] mx-auto bg-slate-900 text-slate-200 rounded-[14px] shadow-2xl py-4 px-5 flex items-center gap-4 flex-wrap"
    >
      <div className="flex-1 min-w-[240px] text-[13px] leading-relaxed">
        We use strictly-necessary cookies to keep you signed in, and analytics
        cookies to understand how the site is used.{' '}
        <Link href="/legal/cookies" className="text-indigo-300 hover:text-indigo-200 underline">
          Read our cookie policy
        </Link>
        .
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => decide('rejected')}
          ghost
          style={{ color: '#e2e8f0', borderColor: '#475569' }}
        >
          Reject
        </Button>
        <Button type="primary" onClick={() => decide('accepted')}>
          Accept all
        </Button>
      </div>
    </div>
  );
}
