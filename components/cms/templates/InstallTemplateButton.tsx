'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App as AntApp, Button, Form, Input, Modal, Typography } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import type { PageTemplate } from '@/lib/page-templates';

const { Text } = Typography;

interface InstallValues {
  slug: string;
  title: string;
}

/**
 * Inline "Install" button used on each card in the template gallery.
 * Opens a modal asking for slug + title, then POSTs to /api/cms/pages
 * with the template's pre-built blocks and jumps to the editor.
 *
 * Mirrors the duplicate-slug handling in NewPageButton — a 409 routes
 * the user to the existing row instead of dead-ending on an error.
 */
export function InstallTemplateButton({
  template,
  block,
}: {
  template: PageTemplate;
  /** Render as a full-width block button (used in the gallery card) */
  block?: boolean;
}) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<InstallValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        slug: template.suggestedSlug,
        title: template.label,
      });
    }
  }, [open, template, form]);

  const onInstall = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      const blocks = template.build();
      const res = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: values.slug.trim(),
          title: values.title.trim(),
          isPublished: false,
          content: { kind: 'blocks', blocks },
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data?.existingId) {
        message.info('Page exists — opening it.');
        setOpen(false);
        router.push(`/cms/pages/${data.existingId}`);
        router.refresh();
        return;
      }

      if (!res.ok) throw new Error(data?.message ?? 'Install failed');
      message.success(`Installed "${template.label}"`);
      setOpen(false);
      router.push(`/cms/pages/${data?.id ?? data?.data?.id}`);
      router.refresh();
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        icon={<CloudDownloadOutlined />}
        onClick={() => setOpen(true)}
        block={block}
      >
        Install
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={`Install "${template.label}"`}
        okText="Install"
        onOk={onInstall}
        confirmLoading={submitting}
        width={520}
      >
        <Text type="secondary" style={{ fontSize: 13 }}>
          {template.description}
        </Text>
        <Form form={form} layout="vertical" requiredMark="optional" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Page title (internal)"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input placeholder={template.label} />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            tooltip="Route key without leading slash."
            rules={[
              { required: true, message: 'Slug is required' },
              {
                pattern: /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/,
                message: 'Lowercase letters, digits, dashes and slashes only.',
              },
            ]}
          >
            <Input addonBefore="/" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
