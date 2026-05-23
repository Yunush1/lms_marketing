'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface NavLeaf { to: string; label: string }
interface NavGroup { label: string; items: NavLeaf[] }
const isGroup = (n: NavLeaf | NavGroup): n is NavGroup => 'items' in n;

interface Props {
  nav: (NavLeaf | NavGroup)[];
  appUrl: string;
}

/**
 * The mobile drawer is the only piece of header that needs JS — it tracks
 * open/closed state and locks body scroll. Splitting it out keeps the rest
 * of the header purely server-rendered (zero client JS).
 */
export function MobileMenu({ nav, appUrl }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden p-1.5 text-slate-700"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-900/40 z-[90]"
          />
          <aside className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white z-[91] p-5 overflow-y-auto shadow-[-12px_0_28px_rgba(15,23,42,0.18)]" role="dialog" aria-label="Menu">
            <div className="flex items-center justify-between mb-5">
              <div className="font-extrabold text-lg text-slate-900">EduSphere</div>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="p-1.5 text-slate-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {nav.map((n) =>
                isGroup(n) ? (
                  <div key={n.label}>
                    <div className="text-xs uppercase text-slate-400 tracking-wide mb-1.5">{n.label}</div>
                    <div className="flex flex-col gap-1.5">
                      {n.items.map((i) => (
                        <Link
                          key={i.to}
                          href={i.to}
                          onClick={() => setOpen(false)}
                          className="text-slate-700 hover:text-[var(--color-brand)] py-1.5 font-medium"
                        >
                          {i.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={n.to}
                    href={n.to}
                    onClick={() => setOpen(false)}
                    className="text-slate-700 hover:text-[var(--color-brand)] py-1.5 font-medium"
                  >
                    {n.label}
                  </Link>
                ),
              )}
              <div className="flex flex-col gap-2 mt-3">
                <a href={`${appUrl}/login`} className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg text-center">
                  Sign in
                </a>
                <a
                  href={`${appUrl}/register`}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white text-center"
                  style={{ background: 'var(--color-brand)' }}
                >
                  Start free
                </a>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
