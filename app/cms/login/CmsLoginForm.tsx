'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { App as AntApp, Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { isCmsRole, type AuthUser } from '@/lib/types';

interface LoginValues {
  email: string;
  password: string;
}

interface LoginApiResponse {
  user?: AuthUser | null;
  message?: string;
}

/**
 * CMS sign-in form. Intentionally bypasses the shared `useLogin` hook
 * because that hook's onSuccess unconditionally redirects to `/me` —
 * which would race the role-gated redirect we do here. We hit the same
 * `/api/auth/login` proxy directly so cookies are still set the same way.
 */
export function CmsLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<LoginValues>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data: LoginApiResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        message.error(data?.message || 'Invalid email or password');
        return;
      }
      const user = data.user;
      if (!user || !isCmsRole(user.role)) {
        // Clear the cookies the proxy just set so a non-CMS user isn't
        // left in a half-authed state. Logout proxy clears both.
        await fetch('/api/auth/logout', { method: 'POST' });
        router.replace('/cms/login?error=not_cms');
        return;
      }
      message.success(`Welcome${user.firstName ? `, ${user.firstName}` : ''}!`);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      message.error((err as Error).message || 'Sign-in failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="editor@edusphere.app" autoComplete="email" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Password is required' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Your password"
          autoComplete="current-password"
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={submitting} block>
        Sign in to CMS
      </Button>
    </Form>
  );
}
