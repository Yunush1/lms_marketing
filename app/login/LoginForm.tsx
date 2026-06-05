'use client';

import { useRouter } from 'next/navigation';
import { Button, Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useLogin } from '@/hooks/useAuth';
import { logEvent } from '@/lib/audit';

interface LoginValues {
  email: string;
  password: string;
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const login = useLogin();
  const [form] = Form.useForm<LoginValues>();

  const onFinish = async (values: LoginValues) => {
    await login.mutateAsync(values);
    logEvent({ event: 'login_completed' });
    if (nextPath?.startsWith('/')) router.push(nextPath);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      size="large"
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder="you@school.com" autoComplete="email" />
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
      <Button type="primary" htmlType="submit" loading={login.isPending} block>
        Sign in
      </Button>
    </Form>
  );
}
