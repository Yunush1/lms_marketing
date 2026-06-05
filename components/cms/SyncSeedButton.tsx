'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App as AntApp, Button } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';

interface SyncResult {
  created: string[];
  existed: string[];
}

/**
 * One-click action that drops a draft CMS row in for every known
 * public-site slug (home, pricing, about, …). Lets editors discover and
 * manage the bundled-seed pages from the dashboard without remembering
 * every slug. Idempotent — re-running is safe.
 */
export function SyncSeedButton() {
  const router = useRouter();
  const { message, modal } = AntApp.useApp();
  const [busy, setBusy] = useState(false);

  const run = () => {
    modal.confirm({
      title: 'Sync seed pages?',
      content:
        'Adds a draft CMS row for every standard page (home, pricing, about, security, legal/*, …). ' +
        'Pages that already have a row are left untouched.',
      okText: 'Sync',
      onOk: async () => {
        setBusy(true);
        try {
          const res = await fetch('/api/cms/pages/sync-seed', { method: 'POST' });
          const data: SyncResult & { message?: string } = await res.json();
          if (!res.ok) throw new Error(data?.message ?? 'Sync failed');
          const c = data.created?.length ?? 0;
          const e = data.existed?.length ?? 0;
          message.success(
            c === 0
              ? `All ${e} pages already in the CMS — nothing to add.`
              : `Created ${c} draft page${c === 1 ? '' : 's'} (${e} already existed).`,
          );
          router.refresh();
        } catch (err) {
          message.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      },
    });
  };

  return (
    <Button icon={<CloudDownloadOutlined />} loading={busy} onClick={run}>
      Sync seed pages
    </Button>
  );
}
