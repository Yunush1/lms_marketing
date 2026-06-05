import React from 'react';

/**
 * Coloured pill that shows a CMS page's editorial state. Lives at the
 * components layer because Next.js page files may only export a small
 * whitelist of named symbols — re-exporting this from
 * `app/cms/(app)/pages/page.tsx` was breaking the production build.
 */
export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    draft: { bg: '#f1f5f9', fg: '#475569', label: 'DRAFT' },
    scheduled: { bg: '#fef3c7', fg: '#92400e', label: 'SCHEDULED' },
    published: { bg: '#dcfce7', fg: '#166534', label: 'PUBLISHED' },
    archived: { bg: '#fee2e2', fg: '#991b1b', label: 'ARCHIVED' },
  };
  const m = map[status] ?? map.draft;
  return (
    <span
      style={{
        background: m.bg,
        color: m.fg,
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {m.label}
    </span>
  );
}
