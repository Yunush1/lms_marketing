'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  App as AntApp,
  Button,
  Drawer,
  Empty,
  List,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { MarketingPageRevision } from '@/lib/types';

dayjs.extend(relativeTime);
const { Text } = Typography;

/**
 * Right-side drawer that lists every snapshot taken for the current
 * page. Each entry shows author + relative timestamp + the original
 * action ("update", "Pre-restore of …") and a Restore button.
 *
 * On Restore we POST to the backend, which (a) snapshots the *current*
 * state so the restore itself is undoable, and (b) overwrites the page
 * with the chosen snapshot but forces it back to draft. We trigger a
 * router refresh + onRestored() so the editor reflects the rolled-back
 * content without a full reload.
 */
export function HistoryDrawer({
  open,
  pageId,
  onClose,
  onRestored,
}: {
  open: boolean;
  pageId: string;
  onClose: () => void;
  /** Called after a successful restore — the parent should reload the
   *  page so the editor reflects the new content. */
  onRestored: () => void;
}) {
  const { message, modal } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [revisions, setRevisions] = useState<MarketingPageRevision[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/cms/pages/${pageId}/revisions?limit=100`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? `List failed (${res.status})`);
      }
      // Backend returns `{ data, total }`; proxy passes it through.
      const list: MarketingPageRevision[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
      setRevisions(list);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  // Refetch every time the drawer is opened so the editor always sees
  // the snapshot they just created by saving.
  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  const restore = (rev: MarketingPageRevision) => {
    modal.confirm({
      title: 'Restore this version?',
      content: (
        <span>
          The current state will be saved as a new revision first, so this
          restore is undoable. The page returns as a <strong>draft</strong> —
          review and republish when you&rsquo;re ready.
        </span>
      ),
      okText: 'Restore',
      onOk: async () => {
        setRestoringId(rev.id);
        try {
          const res = await fetch(
            `/api/cms/pages/${pageId}/revisions/${rev.id}/restore`,
            { method: 'POST' },
          );
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(data?.message ?? `Restore failed (${res.status})`);
          }
          message.success('Restored — now a draft.');
          onRestored();
        } catch (err) {
          message.error((err as Error).message);
        } finally {
          setRestoringId(null);
        }
      },
    });
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Edit history"
      width={420}
      destroyOnHidden
      extra={
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={load}
          loading={loading}
        >
          Refresh
        </Button>
      }
    >
      {loading && revisions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : loadError ? (
        <Empty description={<Text type="danger">{loadError}</Text>} />
      ) : revisions.length === 0 ? (
        <Empty
          description={
            <>
              No history yet. The first revision lands on your next save.
            </>
          }
        />
      ) : (
        <List
          dataSource={revisions}
          renderItem={(rev) => (
            <List.Item
              actions={[
                <Button
                  key="restore"
                  icon={<UndoOutlined />}
                  size="small"
                  loading={restoringId === rev.id}
                  onClick={() => restore(rev)}
                >
                  Restore
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span>
                    <Text strong>
                      {rev.authorName ?? 'Unknown editor'}
                    </Text>
                    {rev.reason && (
                      <Tag color="default" style={{ marginLeft: 8 }}>
                        {rev.reason.length > 28
                          ? `${rev.reason.slice(0, 25)}…`
                          : rev.reason}
                      </Tag>
                    )}
                  </span>
                }
                description={
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    <span title={new Date(rev.createdAt).toLocaleString()}>
                      {dayjs(rev.createdAt).fromNow()}
                    </span>
                    {rev.snapshot?.status && (
                      <span style={{ marginLeft: 12 }}>
                        was <em>{rev.snapshot.status}</em>
                      </span>
                    )}
                  </span>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
}
