'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  App as AntApp,
  Button,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
  type MenuProps,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import type { Block, BlockType, BlocksContent } from '@/lib/blocks';
import { BLOCK_DESCRIPTIONS, BLOCK_LABELS, createBlock, isBlocksContent } from '@/lib/blocks';
import type { MarketingPage, MarketingPageStatus } from '@/lib/types';
import { BlockPanel } from './BlockPanel';
import { HistoryDrawer } from './HistoryDrawer';

const { Text, Title } = Typography;

interface PageEditorProps {
  page: MarketingPage;
}

interface FormState {
  title: string;
  slug: string;
  status: MarketingPageStatus;
  scheduledFor: string | null;
  blocks: Block[];
}

/** Visual hint per status — colour + label drive the header badge. */
const STATUS_META: Record<MarketingPageStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'default' },
  scheduled: { label: 'Scheduled', color: 'gold' },
  published: { label: 'Published', color: 'green' },
  archived: { label: 'Archived', color: 'red' },
};

/**
 * Two-pane block editor for a single marketing_pages row.
 *
 *  ┌─────────────────────┬────────────────────────────┐
 *  │ Block list (left)   │ Selected block panel       │
 *  │  Hero ── selected   │ ── per-type field editor   │
 *  │  Stats              │                            │
 *  │  CTA                │                            │
 *  │  [+ Add block]      │                            │
 *  └─────────────────────┴────────────────────────────┘
 *
 * Save uses the existing `PATCH /marketing/pages/:id` endpoint via the
 * Next.js proxy at `/api/cms/pages/:id` so cookies travel server-side.
 */
export function PageEditor({ page }: PageEditorProps) {
  const router = useRouter();
  const { message, modal } = AntApp.useApp();

  // Seed editor state from the row. If content already uses the blocks
  // shape, hydrate as-is. Otherwise start with an empty block list — the
  // legacy slug-shaped content stays untouched in `content` for the
  // existing renderers, and the new blocks live alongside it.
  const seedBlocks = isBlocksContent(page.content)
    ? (page.content as BlocksContent).blocks
    : [];
  const [state, setState] = useState<FormState>({
    title: page.title,
    slug: page.slug,
    status: page.status,
    scheduledFor: page.scheduledFor ?? null,
    blocks: seedBlocks,
  });
  const [selectedId, setSelectedId] = useState<string | null>(seedBlocks[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const selectedBlock = useMemo(
    () => state.blocks.find((b) => b.id === selectedId) ?? null,
    [state.blocks, selectedId],
  );

  // ── Block list ops ───────────────────────────────────────────────────
  const setBlocks = (next: Block[]) => setState((s) => ({ ...s, blocks: next }));

  const addBlock = (type: BlockType) => {
    const block = createBlock(type);
    setBlocks([...state.blocks, block]);
    setSelectedId(block.id);
    setAddOpen(false);
  };

  const replaceBlock = (next: Block) => {
    setBlocks(state.blocks.map((b) => (b.id === next.id ? next : b)));
  };

  const duplicateBlock = (id: string) => {
    const idx = state.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const clone = { ...state.blocks[idx], id: makeId() } as Block;
    const next = state.blocks.slice();
    next.splice(idx + 1, 0, clone);
    setBlocks(next);
    setSelectedId(clone.id);
  };

  const removeBlock = (id: string) => {
    const next = state.blocks.filter((b) => b.id !== id);
    setBlocks(next);
    if (selectedId === id) setSelectedId(next[0]?.id ?? null);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = state.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const to = idx + dir;
    if (to < 0 || to >= state.blocks.length) return;
    const next = state.blocks.slice();
    const [it] = next.splice(idx, 1);
    next.splice(to, 0, it);
    setBlocks(next);
  };

  // ── Save / status ────────────────────────────────────────────────────

  /** Save title + blocks. Doesn't touch status — that's its own call. */
  const save = async () => {
    if (!state.title.trim()) {
      message.error('Title is required.');
      return;
    }
    if (!state.slug.trim()) {
      message.error('Slug is required.');
      return;
    }
    setSaving(true);
    try {
      // Preserve any legacy fields on `content` alongside our blocks so a
      // partial migration doesn't accidentally erase old per-slug content
      // that other renderers still consume.
      const baseContent =
        page.content && typeof page.content === 'object' && !isBlocksContent(page.content)
          ? (page.content as Record<string, unknown>)
          : {};
      const nextContent: BlocksContent & Record<string, unknown> = {
        ...baseContent,
        kind: 'blocks',
        blocks: state.blocks,
      };

      const res = await fetch(`/api/cms/pages/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.title.trim(),
          // slug intentionally omitted — backend forbids changing slug
          // on an existing row (would invalidate cached URLs).
          content: nextContent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? `Save failed (${res.status})`);
      }
      message.success('Saved');
      router.refresh();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  /** Status transition. Shared by Publish / Unpublish / Schedule /
   *  Archive — the workflow ladder lives entirely on the backend, this
   *  is just a thin call. */
  const setStatus = async (next: MarketingPageStatus, scheduledFor?: string | null) => {
    setStatusBusy(true);
    try {
      // First save current content so a publish doesn't strand the
      // editor's unsaved changes on disk as a draft.
      await save();

      const res = await fetch(`/api/cms/pages/${page.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, scheduledFor: scheduledFor ?? null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Status change failed');
      const updated = (data ?? {}) as Partial<MarketingPage>;
      setState((s) => ({
        ...s,
        status: updated.status ?? next,
        scheduledFor: updated.scheduledFor ?? null,
      }));
      message.success(
        next === 'published'
          ? 'Published'
          : next === 'scheduled'
            ? `Scheduled for ${dayjs(scheduledFor ?? undefined).format('lll')}`
            : next === 'archived'
              ? 'Archived'
              : 'Moved to draft',
      );
      router.refresh();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setStatusBusy(false);
    }
  };

  const openPreview = async () => {
    try {
      const res = await fetch(`/api/cms/pages/${page.id}/preview-token`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Preview failed');
      const token = data?.token ?? data?.data?.token;
      if (!token) throw new Error('Preview token missing');
      window.open(`/p/${state.slug}?preview=${encodeURIComponent(token)}`, '_blank');
    } catch (e) {
      message.error((e as Error).message);
    }
  };

  const confirmDeletePage = () => {
    modal.confirm({
      title: 'Delete this page?',
      content: `This will remove the marketing_pages row for /${state.slug}. Public pages will fall back to the bundled seed.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        const res = await fetch(`/api/cms/pages/${page.id}`, { method: 'DELETE' });
        if (!res.ok) {
          message.error('Could not delete the page.');
          return;
        }
        message.success('Deleted');
        router.push('/cms/pages');
      },
    });
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <Header
        state={state}
        saving={saving || statusBusy}
        onTitleChange={(title) => setState((s) => ({ ...s, title }))}
        onSave={save}
        onSetStatus={setStatus}
        onSchedule={() => setScheduleOpen(true)}
        onPreview={openPreview}
        onHistory={() => setHistoryOpen(true)}
        onDelete={confirmDeletePage}
      />

      {/*
        Responsive layout — sticky two-column on tablet/desktop, single
        column stack on mobile. CSS media query keeps this self-contained
        (no JS reflow / breakpoint-tracking).
      */}
      <style>{`
        .cms-editor-grid {
          display: grid;
          gap: 16px;
          margin-top: 16px;
          grid-template-columns: minmax(260px, 320px) 1fr;
        }
        @media (max-width: 900px) {
          .cms-editor-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="cms-editor-grid">
        <BlockList
          blocks={state.blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={() => setAddOpen(true)}
          onMove={moveBlock}
          onDuplicate={duplicateBlock}
          onRemove={removeBlock}
        />
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 20,
            minHeight: 480,
          }}
        >
          {selectedBlock ? (
            <BlockPanel block={selectedBlock} onChange={replaceBlock} />
          ) : (
            <EmptyEditor onAdd={() => setAddOpen(true)} />
          )}
        </div>
      </div>

      <AddBlockModal open={addOpen} onClose={() => setAddOpen(false)} onPick={addBlock} />
      <ScheduleModal
        open={scheduleOpen}
        initial={state.scheduledFor}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(iso) => {
          setScheduleOpen(false);
          void setStatus('scheduled', iso);
        }}
      />
      <HistoryDrawer
        open={historyOpen}
        pageId={page.id}
        onClose={() => setHistoryOpen(false)}
        onRestored={() => {
          // Backend restored snapshot + reset to draft. Reload the route
          // so the server-fetched `page` reflects the restored content
          // and the local form state gets reseeded.
          setHistoryOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function Header({
  state,
  saving,
  onTitleChange,
  onSave,
  onSetStatus,
  onSchedule,
  onPreview,
  onHistory,
  onDelete,
}: {
  state: FormState;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onSetStatus: (next: MarketingPageStatus, scheduledFor?: string | null) => void;
  onSchedule: () => void;
  onPreview: () => void;
  onHistory: () => void;
  onDelete: () => void;
}) {
  const meta = STATUS_META[state.status];
  const isPublished = state.status === 'published';
  const isScheduled = state.status === 'scheduled';
  const isArchived = state.status === 'archived';

  // The primary action depends on current state:
  //   draft / archived  → Publish (immediately)
  //   scheduled         → Publish now (override the schedule)
  //   published         → Unpublish (drop back to draft)
  const primary = isPublished
    ? { label: 'Unpublish', onClick: () => onSetStatus('draft') }
    : { label: 'Publish', onClick: () => onSetStatus('published') };

  // Secondary actions live in a dropdown so the toolbar stays tidy.
  // Typed as MenuProps['items'] so AntD's discriminated union accepts
  // both menu items and the divider.
  const moreItems: MenuProps['items'] = [
    !isScheduled && !isPublished && {
      key: 'schedule',
      label: 'Schedule…',
      icon: <ClockCircleOutlined />,
      onClick: onSchedule,
    },
    isScheduled && {
      key: 'reschedule',
      label: 'Reschedule…',
      icon: <ClockCircleOutlined />,
      onClick: onSchedule,
    },
    isScheduled && {
      key: 'cancel-schedule',
      label: 'Cancel schedule',
      onClick: () => onSetStatus('draft'),
    },
    {
      key: 'history',
      label: 'History…',
      icon: <HistoryOutlined />,
      onClick: onHistory,
    },
    !isArchived && {
      key: 'archive',
      label: 'Archive',
      onClick: () => onSetStatus('archived'),
    },
    isArchived && {
      key: 'unarchive',
      label: 'Move to draft',
      onClick: () => onSetStatus('draft'),
    },
    { type: 'divider' },
    { key: 'delete', label: 'Delete page', danger: true, icon: <DeleteOutlined />, onClick: onDelete },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Input
          value={state.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Page title"
          variant="borderless"
          style={{ fontSize: 18, fontWeight: 700, padding: 0 }}
        />
        <div
          style={{
            marginTop: 4,
            color: '#64748b',
            fontSize: 12,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Slug: <code>/{state.slug}</code>
          </span>
          <span>
            Status: <Tag color={meta.color}>{meta.label}</Tag>
          </span>
          {isScheduled && state.scheduledFor && (
            <span>
              Goes live: <strong>{dayjs(state.scheduledFor).format('lll')}</strong>
            </span>
          )}
        </div>
      </div>
      <div className="cms-editor-toolbar">
        <Button icon={<EyeOutlined />} onClick={onPreview}>
          Preview
        </Button>
        <Button onClick={primary.onClick} loading={saving}>
          {primary.label}
        </Button>
        <Button type="primary" icon={<SaveOutlined />} onClick={onSave} loading={saving}>
          Save
        </Button>
        <Dropdown menu={{ items: moreItems }}>
          <Button>More</Button>
        </Dropdown>
      </div>
      <style>{`
        .cms-editor-toolbar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .cms-editor-toolbar { width: 100%; }
          .cms-editor-toolbar > * { flex: 1; min-width: 0; }
        }
      `}</style>
    </div>
  );
}

function ScheduleModal({
  open,
  initial,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initial: string | null;
  onClose: () => void;
  onConfirm: (iso: string) => void;
}) {
  const [when, setWhen] = useState<Dayjs | null>(initial ? dayjs(initial) : null);

  // Reset when the modal reopens with a new initial value.
  React.useEffect(() => {
    if (open) setWhen(initial ? dayjs(initial) : null);
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Schedule publish"
      okText="Schedule"
      okButtonProps={{ disabled: !when || when.isBefore(dayjs()) }}
      onOk={() => {
        if (!when) return;
        onConfirm(when.toISOString());
      }}
    >
      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
        Pick a date and time. The page will flip to <strong>Published</strong> within
        ~60 seconds of the scheduled time. You can cancel or reschedule any time.
      </p>
      <DatePicker
        showTime
        style={{ width: '100%' }}
        value={when}
        onChange={setWhen}
        disabledDate={(d) => d.isBefore(dayjs().startOf('day'))}
      />
    </Modal>
  );
}

function BlockList({
  blocks,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onDuplicate,
  onRemove,
}: {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="cms-block-list"
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 12,
        height: 'fit-content',
        // Sticky behaves badly under the single-column mobile layout —
        // the BlockList would float over the panel as the user scrolls.
        // Restrict sticky to the wider breakpoint via the cascade below.
        position: 'sticky',
        top: 16,
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .cms-block-list {
            position: static !important;
            top: auto !important;
          }
        }
      `}</style>
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.06 }}>
        Blocks ({blocks.length})
      </Text>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {blocks.map((b, idx) => {
          const active = b.id === selectedId;
          return (
            <div
              key={b.id}
              onClick={() => onSelect(b.id)}
              style={{
                background: active ? '#eef2ff' : '#f8fafc',
                border: active ? '1px solid #6366f1' : '1px solid transparent',
                borderRadius: 8,
                padding: '8px 10px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                  {BLOCK_LABELS[b.type]}
                </Text>
                <Text type="secondary" ellipsis style={{ fontSize: 11 }}>
                  {blockPreview(b)}
                </Text>
              </div>
              <Space size={2} onClick={(e) => e.stopPropagation()}>
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowUpOutlined />}
                  disabled={idx === 0}
                  onClick={() => onMove(b.id, -1)}
                />
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowDownOutlined />}
                  disabled={idx === blocks.length - 1}
                  onClick={() => onMove(b.id, 1)}
                />
                <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => onDuplicate(b.id)} />
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onRemove(b.id)}
                />
              </Space>
            </div>
          );
        })}
      </div>
      <Button block type="dashed" icon={<PlusOutlined />} onClick={onAdd} style={{ marginTop: 10 }}>
        Add block
      </Button>
    </div>
  );
}

function EmptyEditor({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <Title level={4} style={{ marginBottom: 6 }}>
        No block selected
      </Title>
      <Text type="secondary">Pick a block from the list, or add a new one to get started.</Text>
      <div style={{ marginTop: 18 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Add a block
        </Button>
      </div>
    </div>
  );
}

function AddBlockModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: BlockType) => void;
}) {
  const types: BlockType[] = ['hero', 'richText', 'image', 'stats', 'faq', 'cta', 'form'];
  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Add block" width={640}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            style={{
              textAlign: 'left',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 14,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{BLOCK_LABELS[t]}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
              {BLOCK_DESCRIPTIONS[t]}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────

function blockPreview(b: Block): string {
  switch (b.type) {
    case 'hero':
      return b.title.replace(/\n/g, ' ').slice(0, 50) || '(untitled)';
    case 'richText':
      return b.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50) || '(empty)';
    case 'stats':
      return `${b.items.length} stat${b.items.length === 1 ? '' : 's'}`;
    case 'faq':
      return `${b.items.length} question${b.items.length === 1 ? '' : 's'}`;
    case 'cta':
      return b.title.slice(0, 50);
    case 'image':
      return b.image.alt || b.image.url.slice(-40) || '(no image)';
    case 'form':
      return `${b.fields.length} field${b.fields.length === 1 ? '' : 's'} → ${b.submitLabel || 'submit'}`;
  }
}

function makeId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `b_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
