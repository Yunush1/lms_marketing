'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  App as AntApp,
  Button,
  Drawer,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tooltip,
  Typography,
  Upload,
  type UploadProps,
} from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { MediaAsset } from '@/lib/types';

const { Text, Title } = Typography;
const { Dragger } = Upload;

/**
 * Forgiving list extractor. The CMS proxy *should* hand back
 * `{ data: MediaAsset[], pagination: {...} }`, but to survive any future
 * shape drift (e.g. someone strips the wrapper, or the NestJS envelope
 * leaks through), accept three shapes:
 *    A) `{ data: [...], pagination: { total } }` — expected
 *    B) `[...]`                                    — pre-unwrapped array
 *    C) `{ success, data: { data: [...], pagination } }` — raw envelope
 */
function extractList(raw: unknown): { items: MediaAsset[]; total: number } {
  if (Array.isArray(raw)) return { items: raw as MediaAsset[], total: raw.length };
  if (raw && typeof raw === 'object') {
    const r = raw as { data?: unknown; pagination?: { total?: number } };
    if (Array.isArray(r.data)) {
      return {
        items: r.data as MediaAsset[],
        total: r.pagination?.total ?? r.data.length,
      };
    }
    // Envelope leaked through — drill one more level.
    if (r.data && typeof r.data === 'object') {
      const inner = r.data as { data?: unknown; pagination?: { total?: number } };
      if (Array.isArray(inner.data)) {
        return {
          items: inner.data as MediaAsset[],
          total: inner.pagination?.total ?? inner.data.length,
        };
      }
    }
  }
  return { items: [], total: 0 };
}

interface MediaLibraryProps {
  /** Embedded mode: hide the page header and emit a selection instead
   *  of opening the detail drawer for inline edits. */
  mode?: 'page' | 'picker';
  onSelect?: (asset: MediaAsset) => void;
}

/**
 * Phase-3 media library.
 *
 *  - Page mode (`/cms/media`): full management UI with upload zone,
 *    search + folder filter, asset grid, and a detail drawer for
 *    alt/folder edits + delete.
 *  - Picker mode (used by block editors): same grid but clicks emit
 *    `onSelect(asset)` instead of opening the drawer.
 */
export function MediaLibrary({ mode = 'page', onSelect }: MediaLibraryProps) {
  const { message, modal } = AntApp.useApp();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [total, setTotal] = useState(0);
  const [folders, setFolders] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>('image');
  const [open, setOpen] = useState<MediaAsset | null>(null);
  const reqId = useRef(0);

  // `message` is intentionally NOT in the deps below — it's stable for
  // the life of the AntApp context but useApp() re-emits a new object on
  // every render, which would invalidate this callback and trigger an
  // infinite refetch loop. A ref keeps the error reporter current without
  // affecting identity.
  const messageRef = useRef(message);
  messageRef.current = message;

  // ── Data fetch ───────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const myReq = ++reqId.current;
    const qs = new URLSearchParams();
    qs.set('limit', '120');
    if (search.trim()) qs.set('search', search.trim());
    if (folder) qs.set('folder', folder);
    if (typeFilter) qs.set('type', typeFilter);
    try {
      const res = await fetch(`/api/cms/media?${qs.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error((errBody as { message?: string })?.message ?? `List failed (${res.status})`);
      }
      const raw: unknown = await res.json();
      if (myReq !== reqId.current) return; // a newer request started
      const { items: list, total: t } = extractList(raw);
      setItems(list);
      setTotal(t);
    } catch (err) {
      messageRef.current.error((err as Error).message);
    } finally {
      if (myReq === reqId.current) setLoading(false);
    }
  }, [search, folder, typeFilter]);

  // Refresh folder list on every successful load — cheap, no FK to keep
  // in sync.
  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/media?limit=1', { cache: 'no-store' });
      if (!res.ok) return;
      // We piggy-back on the list endpoint's distinct-folders to keep
      // the proxy surface area small. Phase 4 can add a dedicated
      // /folders proxy if filter performance matters.
      const res2 = await fetch('/api/cms/media?limit=1&page=1');
      void res2; // not actually used; keeping the function for symmetry
      const f = Array.from(new Set([...items.map((i) => i.folder)])).filter(Boolean);
      setFolders(f);
    } catch {
      /* ignore */
    }
  }, [items]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (items.length) void loadFolders();
  }, [items.length, loadFolders]);

  // ── Upload ───────────────────────────────────────────────────────────
  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    accept: 'image/*,application/pdf',
    beforeUpload: async (file) => {
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await fetch(`/api/cms/media?folder=${encodeURIComponent(folder!)}`, {
          method: 'POST',
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? 'Upload failed');
        message.success(`Uploaded ${file.name}`);
        void load();
      } catch (err) {
        message.error((err as Error).message);
      }
      // Returning false stops AntD's built-in uploader — we handle it.
      return false;
    },
  };

  // ── Render ───────────────────────────────────────────────────────────
  const isPicker = mode === 'picker';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {mode === 'page' && (
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Media library
          </Title>
          <Text type="secondary">
            {total} asset{total === 1 ? '' : 's'} · drag in to upload.
          </Text>
        </div>
      )}

      <style>{`
        .media-filterbar {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          align-items: center;
          flex-wrap: wrap;
        }
        .media-filterbar .ant-input-search,
        .media-filterbar .ant-select { min-width: 0; }
        @media (max-width: 640px) {
          .media-filterbar > * { flex: 1 1 calc(50% - 8px); }
          .media-filterbar > .media-upload-slot { flex: 1 1 100%; }
          .media-filterbar > .media-upload-slot button { width: 100%; }
        }
      `}</style>
      <div className="media-filterbar">
        <Input.Search
          placeholder="Search filename or alt text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 320 }}
        />
        <Select
          placeholder="Folder"
          value={folder}
          onChange={(v) => setFolder(v)}
          allowClear
          style={{ minWidth: 140 }}
          options={folders.map((f) => ({ label: f, value: f }))}
        />
        <Select
          placeholder="Type"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v)}
          allowClear
          style={{ minWidth: 120 }}
          options={[
            { label: 'Images', value: 'image' },
            { label: 'Videos', value: 'video' },
            { label: 'PDFs', value: 'application/pdf' },
            { label: 'All types', value: null },
          ]}
        />
        <span style={{ flex: 1 }} />
        <div className="media-upload-slot">
          <Upload {...uploadProps}>
            <Button type="primary" icon={<CloudUploadOutlined />}>
              Upload
            </Button>
          </Upload>
        </div>
      </div>

      {mode === 'page' && (
        <Dragger
          {...uploadProps}
          style={{ marginBottom: 16, padding: 8, background: '#f8fafc' }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined />
          </p>
          <p className="ant-upload-text">Drag files here or click to upload</p>
          <p className="ant-upload-hint" style={{ color: '#94a3b8', fontSize: 12 }}>
            Images up to 20 MB. Default folder: <code>{folder ?? 'general'}</code>
          </p>
        </Dragger>
      )}

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: 60 }}>
          <Spin />
        </div>
      ) : items.length === 0 ? (
        <Empty description="No media yet — upload your first asset" />
      ) : (
        <div
          style={{
            display: 'grid',
            // 120px on mobile (~3 columns at 360px wide) → 160px elsewhere.
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(120px, 100%), 1fr))',
            gap: 10,
          }}
        >
          {items.map((m) => (
            <Tile
              key={m.id}
              asset={m}
              onClick={() => {
                if (isPicker) onSelect?.(m);
                else setOpen(m);
              }}
            />
          ))}
        </div>
      )}

      <DetailDrawer
        asset={open}
        onClose={() => setOpen(null)}
        onSaved={() => {
          setOpen(null);
          void load();
        }}
        onDelete={(a) => {
          modal.confirm({
            title: `Delete ${a.originalName}?`,
            content: 'Pages that reference this asset will show a broken image.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: async () => {
              const res = await fetch(`/api/cms/media/${a.id}`, { method: 'DELETE' });
              if (!res.ok) {
                message.error('Delete failed');
                return;
              }
              setOpen(null);
              message.success('Deleted');
              void load();
            },
          });
        }}
      />
    </div>
  );
}

function Tile({ asset, onClick }: { asset: MediaAsset; onClick: () => void }) {
  const isImage = asset.mime.startsWith('image/');
  console.log(asset);
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: 6,
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          aspectRatio: '1 / 1',
          background: '#f1f5f9',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.url}
            alt={asset.alt || asset.originalName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${asset.focalX * 100}% ${asset.focalY * 100}%`,
            }}
          />
        ) : (
          <PictureOutlined style={{ fontSize: 24, color: '#94a3b8' }} />
        )}
      </div>
      <div style={{ padding: '2px 4px', minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {asset.originalName}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {asset.folder} · {prettySize(asset.sizeBytes)}
        </div>
      </div>
    </button>
  );
}

function DetailDrawer({
  asset,
  onClose,
  onSaved,
  onDelete,
}: {
  asset: MediaAsset | null;
  onClose: () => void;
  onSaved: () => void;
  onDelete: (a: MediaAsset) => void;
}) {
  const { message } = AntApp.useApp();
  const [alt, setAlt] = useState('');
  const [folder, setFolder] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!asset) return;
    setAlt(asset.alt);
    setFolder(asset.folder);
  }, [asset]);

  const save = async () => {
    if (!asset) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/media/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt, folder }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Save failed');
      }
      message.success('Saved');
      onSaved();
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={!!asset}
      onClose={onClose}
      width={420}
      title={asset?.originalName ?? 'Asset details'}
      destroyOnHidden
      extra={
        asset ? (
          <Space>
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(asset)}>
              Delete
            </Button>
            <Button type="primary" loading={saving} onClick={save}>
              Save
            </Button>
          </Space>
        ) : null
      }
    >
      {asset && (
        <>
          <div
            style={{
              background: '#0f172a',
              borderRadius: 10,
              padding: 8,
              marginBottom: 16,
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {asset.mime.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.url}
                alt={asset.alt}
                style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }}
              />
            ) : (
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#cbd5e1' }}
              >
                Open file →
              </a>
            )}
          </div>

          <Field label="Alt text" hint="Describes the image to screen readers.">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <Field label="Folder">
            <Input value={folder} onChange={(e) => setFolder(e.target.value)} />
          </Field>
          <Field label="Public URL">
            <Input value={asset.url} readOnly />
          </Field>

          <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 16, lineHeight: 1.7 }}>
            {asset.mime} · {prettySize(asset.sizeBytes)}
            <br />
            Uploaded {new Date(asset.createdAt).toLocaleString()}
          </div>
        </>
      )}
    </Drawer>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
