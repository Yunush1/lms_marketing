'use client';

import { useMemo, useState } from 'react';
import { Button, Empty, Input, Modal, Space, Typography } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { PAGE_TEMPLATES, type PageTemplate } from '@/lib/page-templates';
import { InstallTemplateButton } from './InstallTemplateButton';

const { Title, Text } = Typography;

type CategoryFilter = 'all' | PageTemplate['category'];

const CATEGORY_LABEL: Record<CategoryFilter, string> = {
  all: 'All',
  general: 'General',
  marketing: 'Marketing',
  sales: 'Sales',
  company: 'Company',
  events: 'Events',
};

/**
 * Gallery surface — chips + search + grid of cards. Cards intentionally
 * carry only the metadata (label, description, category) so the
 * "preview" is the *real* template rendered in an iframe via the
 * Preview button. The full-page rendering inside the modal is the
 * trustworthy version — editors see exactly what Install will deliver.
 *
 * Roadmap (Phase B): replace the modal-only preview with always-on
 * inline iframes per card. Same backing route (`/cms/preview/[key]`),
 * just embedded smaller — like the WordPress block-theme picker.
 */
export function TemplateGallery() {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [previewing, setPreviewing] = useState<PageTemplate | null>(null);

  const counts = useMemo(() => {
    const out: Record<CategoryFilter, number> = {
      all: PAGE_TEMPLATES.length,
      general: 0,
      marketing: 0,
      sales: 0,
      company: 0,
      events: 0,
    };
    for (const t of PAGE_TEMPLATES) out[t.category]++;
    return out;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PAGE_TEMPLATES.filter((t) => {
      if (category !== 'all' && t.category !== category) return false;
      if (q && !`${t.label} ${t.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, query]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          Templates
        </Title>
        <Text type="secondary">
          Browse pre-built page layouts. Hit <strong>Preview</strong> to render the
          real page in a full-size frame; <strong>Install</strong> creates a new
          page you can edit.
        </Text>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Input
          allowClear
          placeholder="Search templates"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ maxWidth: 320 }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(Object.keys(CATEGORY_LABEL) as CategoryFilter[]).map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  background: active ? '#4f46e5' : '#fff',
                  border: '1px solid ' + (active ? '#4f46e5' : '#e2e8f0'),
                  color: active ? '#fff' : '#475569',
                  padding: '6px 12px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {CATEGORY_LABEL[c]}
                <span style={{ marginLeft: 6, opacity: 0.6 }}>{counts[c]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty description="No templates match your search." />
      ) : (
        <div
          style={{
            display: 'grid',
            // Card minimum drops from 280 → 100% on the narrowest screens
            // so a single full-width card still fits at 320px wide.
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((t) => (
            <TemplateCard
              key={t.key}
              template={t}
              onPreview={() => setPreviewing(t)}
            />
          ))}
        </div>
      )}

      <PreviewModal template={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}

function TemplateCard({
  template,
  onPreview,
}: {
  template: PageTemplate;
  onPreview: () => void;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover — clean, no fake layout drawings. The real preview lives
          behind the Preview button. */}
      <button
        type="button"
        onClick={onPreview}
        style={{
          position: 'relative',
          aspectRatio: '16 / 10',
          background: template.coverGradient,
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
        }}
        aria-label={`Preview ${template.label}`}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              opacity: 0.7,
              textTransform: 'uppercase',
            }}
          >
            {template.category}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
            {template.label}
          </div>
          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(15,23,42,0.4)',
              borderRadius: 999,
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <EyeOutlined /> Preview
          </div>
        </div>
      </button>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            color: '#64748b',
            fontSize: 13,
            lineHeight: 1.6,
            flex: 1,
            minHeight: 60,
          }}
        >
          {template.description}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <Button icon={<EyeOutlined />} onClick={onPreview} style={{ flex: 1 }}>
            Preview
          </Button>
          <div style={{ flex: 1 }}>
            <InstallTemplateButton template={template} block />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal that loads the real template render in an iframe pointing at
 * `/cms/preview/<key>`. The iframe shares cookies with the parent (same
 * origin), so the preview route's auth gate just works.
 */
function PreviewModal({
  template,
  onClose,
}: {
  template: PageTemplate | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!template}
      onCancel={onClose}
      footer={null}
      // 100% width + 0 top on mobile (modal goes edge-to-edge), capped at
      // 1200/20 on larger screens.
      width="100%"
      style={{ top: 0, maxWidth: 1200, padding: 0 }}
      styles={{ body: { padding: 12 } }}
      title={
        template ? (
          <Space wrap>
            <span>{template.label}</span>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              {template.description}
            </Text>
          </Space>
        ) : null
      }
      destroyOnHidden
    >
      {template && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <iframe
            key={template.key}
            src={`/cms/preview/${template.key}`}
            title={`Preview of ${template.label}`}
            style={{
              width: '100%',
              // Full-ish viewport on phones, room for the title bar on
              // larger screens.
              height: 'calc(100vh - 180px)',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              background: '#fff',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <Button onClick={onClose}>Close</Button>
            <InstallTemplateButton template={template} />
          </div>
        </div>
      )}
    </Modal>
  );
}
