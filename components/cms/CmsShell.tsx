'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Button, Drawer, Dropdown, Grid, Layout, Menu, Typography } from 'antd';
import {
  AppstoreOutlined,
  BlockOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  PictureOutlined,
  ReadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLogout } from '@/hooks/useAuth';
import type { AuthUser } from '@/lib/types';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

/**
 * Persistent CMS chrome — left sidebar with the main sections, top bar
 * with the user menu. Responsive:
 *   - md and up   → permanent left Sider, content sits to the right.
 *   - below md    → Sider hides; a hamburger in the header opens a Drawer
 *                   with the same nav, then auto-closes on navigate so the
 *                   editor can get back to the content.
 *
 * Auth-gated by the wrapping server layout; this component is pure
 * presentation.
 */
export interface CmsShellProps {
  user: AuthUser;
  children: React.ReactNode;
}

interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Sections still in build-out — listed so the IA is visible. */
  upcoming?: boolean;
}

const NAV: NavItem[] = [
  { key: 'dashboard', href: '/cms', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'pages', href: '/cms/pages', label: 'Pages', icon: <AppstoreOutlined /> },
  { key: 'templates', href: '/cms/templates', label: 'Templates', icon: <BlockOutlined /> },
  { key: 'media', href: '/cms/media', label: 'Media', icon: <PictureOutlined /> },
  { key: 'posts', href: '/cms/posts', label: 'Posts', icon: <FileTextOutlined />, upcoming: true },
  { key: 'docs', href: '/cms/docs', label: 'Docs', icon: <ReadOutlined />, upcoming: true },
  { key: 'settings', href: '/cms/settings', label: 'Settings', icon: <SettingOutlined />, upcoming: true },
];

export function CmsShell({ user, children }: CmsShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const screens = useBreakpoint();
  // AntD breakpoint `md` ≈ 768px. Mobile + small tablets get the drawer;
  // landscape tablets + desktops get the permanent sider.
  const isMobile = !screens.md;

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close the drawer whenever the user navigates so they're not
  // stuck on a covered editor.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /** Pick the deepest matching nav key based on pathname. */
  const activeKey = useMemo(() => {
    const exact = NAV.find((n) => n.href === pathname);
    if (exact) return exact.key;
    const prefix = NAV.filter((n) => n.href !== '/cms' && pathname.startsWith(n.href + '/'));
    return prefix.at(-1)?.key ?? 'dashboard';
  }, [pathname]);

  const initials = (user.firstName?.[0] ?? user.email[0] ?? '?').toUpperCase();
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  const userMenu = [
    { key: 'view-site', label: 'View public site', onClick: () => router.push('/') },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Sign out',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => logout.mutate(),
    },
  ];

  const navMenu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[activeKey]}
      style={{ background: 'transparent', borderRight: 0 }}
      items={NAV.map((n) => ({
        key: n.key,
        icon: n.icon,
        label: (
          <Link href={n.href} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{n.label}</span>
            {n.upcoming && (
              <Text style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600 }}>
                SOON
              </Text>
            )}
          </Link>
        ),
      }))}
    />
  );

  const brand = (
    <div style={{ padding: '20px 16px', color: '#fff' }}>
      <Link href="/cms" style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
        EduSphere CMS
      </Link>
      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Phase 1</div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Permanent sider — desktop + landscape tablet. */}
      {!isMobile && (
        <Sider
          width={220}
          breakpoint="lg"
          collapsedWidth={64}
          style={{ background: '#0f172a' }}
        >
          {brand}
          {navMenu}
        </Sider>
      )}

      {/* Drawer sider — mobile + portrait tablet. */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={260}
          closable={false}
          styles={{
            body: { padding: 0, background: '#0f172a' },
            header: { display: 'none' },
          }}
        >
          {brand}
          {navMenu}
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            padding: isMobile ? '0 12px' : '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation"
              />
            )}
            <Text
              strong
              style={{
                fontSize: 16,
                color: '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {NAV.find((n) => n.key === activeKey)?.label ?? 'CMS'}
            </Text>
          </div>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Button
              type="text"
              style={{ height: 'auto', padding: '4px 8px', maxWidth: '60vw' }}
            >
              <Avatar style={{ backgroundColor: '#6366f1', verticalAlign: 'middle' }} size="small">
                {initials}
              </Avatar>
              {!isMobile && (
                <>
                  <span style={{ marginLeft: 8 }}>{displayName}</span>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 11 }}>
                    {user.role.replace('_', ' ')}
                  </Text>
                </>
              )}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ padding: isMobile ? 12 : 24, background: '#f8fafc' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
