'use client';

import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useLogout } from '@/hooks/useAuth';

export function LogoutButton() {
  const logout = useLogout();
  return (
    <Button
      icon={<LogoutOutlined />}
      loading={logout.isPending}
      onClick={() => logout.mutate()}
    >
      Sign out
    </Button>
  );
}
