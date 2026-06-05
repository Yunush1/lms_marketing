'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  App as AntApp,
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Space,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type {
  HeaderItem,
  SiteNavColumn,
  SiteNavConfig,
  SiteNavLink,
} from '@/lib/site-nav';
import {
  BUNDLED_HEADER_NAV,
  EMPTY_SITE_NAV,
  HEADER_BUILTIN_GROUPS,
  SITE_NAV_SLUG,
  syncBundledNav,
} from '@/lib/site-nav';

const { Text, Title } = Typography;

interface Props {
  /** Existing CMS row id when one is present, otherwise null. */
  pageId: string | null;
  initial: SiteNavConfig;
  /** Page status from the existing row; absent = no row yet. */
  initialStatus?: 'draft' | 'scheduled' | 'published' | 'archived' | null;
}

/**
 * Standalone editor for the site-wide navigation overrides. Handles
 * both creation (no row exists yet) and update flows.
 *
 *  - On Save, we PATCH the existing marketing_pages row OR POST a new
 *    one with the reserved slug + content shape.
 *  - On Publish, we additionally flip status → published so Header /
 *    Footer pick the row up on their next ISR window (~10 min).
 *
 * The bundled header dropdowns + footer columns aren't editable here
 * by design — they stay hardcoded in Header.tsx / Footer.tsx so a CMS
 * mishap can't erase the site's core nav. Editors add *extra* items.
 */
export function NavigationEditor({ pageId, initial, initialStatus }: Props) {
  const router = useRouter();
  const { message, modal } = AntApp.useApp();
  const [config, setConfig] = useState<SiteNavConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(initialStatus === 'published');

  const patch = (next: Partial<SiteNavConfig>) =>
    setConfig((s) => ({ ...s, ...next }));

  // ── Full header (new mode) ───────────────────────────────────────────
  const setHeaderItems = (items: HeaderItem[]) => patch({ headerItems: items });

  const isCustomised = config.headerItems.length > 0;

  /** Sync = copy the bundled nav into the CMS row AND fold any legacy
   *  extras the user had already saved. Editor flips to full-customise
   *  mode after this. */
  const syncFromBundled = () => {
    setHeaderItems(
      syncBundledNav({
        headerGroupExtras: config.headerGroupExtras,
        headerGroups: config.headerGroups,
        headerExtras: config.headerExtras,
      }),
    );
  };

  /** Revert = drop back to the bundled nav. We empty headerItems so the
   *  Header.tsx fallback kicks in. The user's legacy extras stay intact
   *  in the row in case they want to flip back later. */
  const revertToBundled = () => {
    modal.confirm({
      title: 'Revert to the bundled navbar?',
      content:
        "Your customised header layout will be discarded. The site will go back to using the bundled navbar from code. You can re-sync any time.",
      okText: 'Revert',
      okButtonProps: { danger: true },
      onOk: () => setHeaderItems([]),
    });
  };

  // ── Header extras (legacy mode — only used when headerItems is empty) ─
  const setHeaderExtras = (items: SiteNavLink[]) => patch({ headerExtras: items });

  // Per-built-in-group extras. Editing the items list for `Resources`
  // replaces the value at `headerGroupExtras["Resources"]` without
  // touching any other group's items.
  const setGroupExtras = (group: string, items: SiteNavLink[]) =>
    patch({
      headerGroupExtras: { ...config.headerGroupExtras, [group]: items },
    });

  // ── Custom dropdowns ─────────────────────────────────────────────────
  const setHeaderGroups = (groups: SiteNavColumn[]) =>
    patch({ headerGroups: groups });

  // ── Footer columns + bottom row ──────────────────────────────────────
  const setFooterColumns = (cols: SiteNavColumn[]) => patch({ footerColumns: cols });
  const setFooterBottomLinks = (items: SiteNavLink[]) =>
    patch({ footerBottomLinks: items });

  // ── Save / publish ───────────────────────────────────────────────────
  const persist = async (opts: { publish?: boolean } = {}) => {
    setSaving(true);
    try {
      let res: Response;
      if (pageId) {
        // Existing row — PATCH content + (optionally) status.
        res = await fetch(`/api/cms/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: config,
            ...(opts.publish ? { status: 'published' } : {}),
          }),
        });
      } else {
        // No row yet — POST with the reserved slug. We default to
        // immediate publish since editors only land here when they want
        // these items live.
        res = await fetch(`/api/cms/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: SITE_NAV_SLUG,
            title: 'Site navigation overrides',
            isPublished: opts.publish ?? true,
            content: config,
          }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? 'Save failed');
      message.success(opts.publish ? 'Saved + published' : 'Saved');
      if (opts.publish) setPublished(true);
      router.refresh();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Navigation
          </Title>
          <Text type="secondary">
            Add links to the navbar and footer so visitors can reach the pages
            your team has authored. Bundled dropdowns + columns stay in place —
            these are additions on top.
          </Text>
        </div>
        <Space>
          <Button onClick={() => persist()} loading={saving} icon={<SaveOutlined />}>
            Save draft
          </Button>
          <Button
            type="primary"
            onClick={() => persist({ publish: true })}
            loading={saving}
          >
            {published ? 'Republish' : 'Save + publish'}
          </Button>
        </Space>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
        message={
          published
            ? 'These items are live on every page once Next.js revalidates (≤10 min).'
            : 'Saved as draft — Header + Footer keep showing the previous published version until you republish.'
        }
      />

      <Card
        title="Header layout"
        style={{ marginBottom: 20 }}
        extra={
          isCustomised ? (
            <Space>
              <Button onClick={syncFromBundled}>Resync from bundled</Button>
              <Button danger onClick={revertToBundled}>
                Revert to bundled
              </Button>
            </Space>
          ) : (
            <Button type="primary" onClick={syncFromBundled}>
              Sync current navbar
            </Button>
          )
        }
      >
        {!isCustomised ? (
          <>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Currently using the bundled navbar from code (<strong>{BUNDLED_HEADER_NAV.length}</strong>{' '}
              top-level items). Click <strong>Sync current navbar</strong> to copy them into the CMS so
              you can rearrange / rename / remove anything — no code change needed.
            </Text>
            <Text type="secondary" style={{ display: 'block' }}>
              Any extras you've already added below will come along with the sync.
            </Text>
          </>
        ) : (
          <>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="Full customisation mode — the navbar on the public site now renders entirely from this list. Bundled defaults are no longer used."
            />
            <HeaderItemList items={config.headerItems} onChange={setHeaderItems} />
          </>
        )}
      </Card>

      {isCustomised ? null : (
      <>
      <Card title="Add into an existing header dropdown" style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Each section below maps to a built-in dropdown in the header.
          Items you add land at the bottom of that dropdown next to the
          bundled options — handy for steering visitors to a CMS-authored
          page like <code>/p/case-greenwood</code>.
        </Text>
        {HEADER_BUILTIN_GROUPS.map((group) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
              Under <code>{group}</code>
            </Text>
            <LinkList
              items={config.headerGroupExtras[group] ?? []}
              onChange={(items) => setGroupExtras(group, items)}
              addLabel={`Add a link under ${group}`}
            />
          </div>
        ))}
      </Card>

      <Card title="Custom header dropdowns" style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Spin up a brand-new dropdown — e.g. <code>Posts</code> with
          links to a few /p/&lt;slug&gt; pages your team has shipped.
          Custom dropdowns render after every built-in group.
        </Text>
        <ColumnList items={config.headerGroups} onChange={setHeaderGroups} />
      </Card>

      <Card title="Top-level header links" style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Flat links appended after every dropdown — visible at all
          times, not nested. Use sparingly so the navbar stays scannable.
        </Text>
        <LinkList
          items={config.headerExtras}
          onChange={setHeaderExtras}
          addLabel="Add a top-level link"
        />
      </Card>
      </>
      )}

      <Card title="Footer columns" style={{ marginBottom: 20 }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Each column gets a heading and a list of links. Added after the
          bundled Product / Solutions / Resources / Company columns.
        </Text>
        <ColumnList items={config.footerColumns} onChange={setFooterColumns} />
      </Card>

      <Card title="Footer bottom row">
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          Tiny links next to Terms / Privacy / DPA / Cookies. Good for
          press kits, status pages, etc.
        </Text>
        <LinkList
          items={config.footerBottomLinks}
          onChange={setFooterBottomLinks}
          addLabel="Add bottom-row link"
        />
      </Card>
    </div>
  );
}

// ─── Sub-editors ──────────────────────────────────────────────────────

/**
 * Re-orderable list of `{ label, target }` rows. Used both for the
 * header extras and the footer bottom row.
 */
function LinkList({
  items,
  onChange,
  addLabel,
}: {
  items: SiteNavLink[];
  onChange: (next: SiteNavLink[]) => void;
  addLabel: string;
}) {
  const update = (idx: number, patch: Partial<SiteNavLink>) => {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  return (
    <>
      {items.length === 0 && (
        <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
          No links yet.
        </Text>
      )}
      {items.map((it, idx) => (
        <Space.Compact key={idx} style={{ width: '100%', marginBottom: 8 }}>
          <Input
            placeholder="Label"
            value={it.label}
            onChange={(e) => update(idx, { label: e.target.value })}
            style={{ width: '40%' }}
          />
          <Input
            placeholder="/p/your-page or https://…"
            value={it.target}
            onChange={(e) => update(idx, { target: e.target.value })}
          />
          <Button
            icon={<ArrowUpOutlined />}
            disabled={idx === 0}
            onClick={() => move(idx, idx - 1)}
          />
          <Button
            icon={<ArrowDownOutlined />}
            disabled={idx === items.length - 1}
            onClick={() => move(idx, idx + 1)}
          />
          <Button icon={<DeleteOutlined />} danger onClick={() => remove(idx)} />
        </Space.Compact>
      ))}
      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => onChange([...items, { label: '', target: '' }])}
      >
        {addLabel}
      </Button>
    </>
  );
}

/**
 * Re-orderable list of top-level header items. Each row is either:
 *  - A flat link (label + target)
 *  - A dropdown group (label + nested LinkList for its items)
 *
 * Mirrors LinkList ergonomically — move up / down / delete per row —
 * with a Type toggle to flip between link and group, and an inline
 * LinkList for groups so editors can manage child items without
 * leaving the row.
 */
function HeaderItemList({
  items,
  onChange,
}: {
  items: HeaderItem[];
  onChange: (next: HeaderItem[]) => void;
}) {
  const update = (idx: number, next: HeaderItem) => {
    const out = items.slice();
    out[idx] = next;
    onChange(out);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  return (
    <>
      {items.map((it, idx) => (
        <Card
          key={idx}
          size="small"
          style={{ marginBottom: 12 }}
          title={
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder={it.kind === 'group' ? 'Dropdown label' : 'Link label'}
                value={it.label}
                onChange={(e) =>
                  update(idx, { ...it, label: e.target.value } as HeaderItem)
                }
              />
              <Button
                // Toggle between link and group. Switching link→group
                // preserves the label and seeds an empty items list;
                // group→link grabs the first item's target as a sensible
                // default.
                onClick={() => {
                  if (it.kind === 'link') {
                    update(idx, { kind: 'group', label: it.label, items: [] });
                  } else {
                    update(idx, {
                      kind: 'link',
                      label: it.label,
                      target: it.items[0]?.target ?? '',
                    });
                  }
                }}
              >
                {it.kind === 'group' ? 'Make link' : 'Make dropdown'}
              </Button>
            </Space.Compact>
          }
          extra={
            <Space>
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={idx === 0}
                onClick={() => move(idx, idx - 1)}
              />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={idx === items.length - 1}
                onClick={() => move(idx, idx + 1)}
              />
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => remove(idx)}
              />
            </Space>
          }
        >
          {it.kind === 'link' ? (
            <Input
              placeholder="/p/your-page or https://…"
              value={it.target}
              onChange={(e) =>
                update(idx, { ...it, target: e.target.value } as HeaderItem)
              }
            />
          ) : (
            <LinkList
              items={it.items}
              onChange={(nextItems) =>
                update(idx, { ...it, items: nextItems } as HeaderItem)
              }
              addLabel="Add item to this dropdown"
            />
          )}
        </Card>
      ))}
      <Space style={{ width: '100%', flexWrap: 'wrap' }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() =>
            onChange([...items, { kind: 'link', label: '', target: '' }])
          }
        >
          Add link
        </Button>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() =>
            onChange([...items, { kind: 'group', label: 'New dropdown', items: [] }])
          }
        >
          Add dropdown
        </Button>
      </Space>
    </>
  );
}

/**
 * Re-orderable list of footer columns, each with its own inner LinkList.
 */
function ColumnList({
  items,
  onChange,
}: {
  items: SiteNavColumn[];
  onChange: (next: SiteNavColumn[]) => void;
}) {
  const update = (idx: number, patch: Partial<SiteNavColumn>) => {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  return (
    <>
      {items.map((col, idx) => (
        <Card
          key={idx}
          size="small"
          style={{ marginBottom: 12 }}
          title={
            <Input
              placeholder="Column heading"
              value={col.heading}
              onChange={(e) => update(idx, { heading: e.target.value })}
            />
          }
          extra={
            <Space>
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={idx === 0}
                onClick={() => move(idx, idx - 1)}
              />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={idx === items.length - 1}
                onClick={() => move(idx, idx + 1)}
              />
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(idx)} />
            </Space>
          }
        >
          <LinkList
            items={col.items}
            onChange={(nextItems) => update(idx, { items: nextItems })}
            addLabel="Add link to this column"
          />
        </Card>
      ))}
      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() =>
          onChange([...items, { heading: 'New column', items: [] }])
        }
      >
        Add footer column
      </Button>
    </>
  );
}

// Helper for parent server pages that have no existing row.
export const EMPTY_NAV_DEFAULT = EMPTY_SITE_NAV;
// Re-export so server pages don't have to dual-import.
export type { SiteNavConfig, SiteNavColumn, SiteNavLink };

// Avoid unused-import warning when ts-checking standalone.
Row;
Col;
Divider;
