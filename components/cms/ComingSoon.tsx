import React from 'react';

/**
 * Placeholder card used by sidebar sections that haven't shipped yet.
 * Surfaces which phase of the CMS roadmap the section is gated on so
 * editors know roughly when to expect it instead of seeing a 404.
 */
export function ComingSoon({
  title,
  subtitle,
  phase,
  detail,
}: {
  title: string;
  subtitle: string;
  phase: string;
  detail: string;
}) {
  return (
    <div style={{ maxWidth: 720, margin: '40px auto', textAlign: 'center' }}>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '40px 32px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: '#eef2ff',
            color: '#4f46e5',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          {phase}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '14px 0 6px' }}>
          {title}
        </h1>
        <div style={{ color: '#475569', fontSize: 14 }}>{subtitle}</div>
        <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.8, marginTop: 18 }}>
          {detail}
        </p>
      </div>
    </div>
  );
}
