import { redirect } from 'next/navigation';
import { getCmsUser } from '@/lib/auth-server';
import { CmsShell } from '@/components/cms/CmsShell';

/**
 * Auth gate for every /cms/* page except /cms/login. Runs on the server,
 * so unauth'd users are redirected before any HTML is sent.
 *
 * Anything outside the (app) route group — currently just /cms/login —
 * skips this layout and is reachable without a session.
 */
export const dynamic = 'force-dynamic';

export default async function CmsAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCmsUser();
  if (!user) redirect('/cms/login?next=/cms');
  return <CmsShell user={user}>{children}</CmsShell>;
}
