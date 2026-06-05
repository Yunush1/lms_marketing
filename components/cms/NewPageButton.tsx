'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App as AntApp, Button, Form, Input, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { findTemplate, PAGE_TEMPLATES } from '@/lib/page-templates';

const { Text } = Typography;

interface NewPageValues {
  slug: string;
  title: string;
}

/**
 * Standalone "New page" button + modal. Lets editors pick a template
 * (Blank, Landing, About, Contact, Pricing teaser, …), then creates a
 * marketing_pages row pre-populated with that template's blocks and
 * jumps straight to the editor.
 *
 * Templates live in lib/page-templates.ts — adding a new one is one
 * entry there with no edits needed here.
 */
export function NewPageButton() {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<NewPageValues>();
  const [submitting, setSubmitting] = useState(false);
  const [templateKey, setTemplateKey] = useState<string>('blank');

  // When the user picks a template, suggest its slug too — but only if
  // they haven't typed something already.
  useEffect(() => {
    if (!open) return;
    const t = findTemplate(templateKey);
    if (!t) return;
    const current = form.getFieldValue('slug') ?? '';
    if (!current || current === 'my-page' || PAGE_TEMPLATES.some((p) => p.suggestedSlug === current)) {
      form.setFieldsValue({ slug: t.suggestedSlug });
    }
  }, [templateKey, open, form]);

  const onCreate = async () => {
    const values = await form.validateFields();
    const template = findTemplate(templateKey);
    setSubmitting(true);
    try {
      const blocks = template ? template.build() : [];
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

      // 409 = slug already taken; route to the existing row.
      if (res.status === 409 && data?.existingId) {
        message.info('Page exists — opening it.');
        setOpen(false);
        form.resetFields();
        router.push(`/cms/pages/${data.existingId}`);
        router.refresh();
        return;
      }

      if (!res.ok) throw new Error(data?.message ?? 'Create failed');
      message.success(
        template?.key === 'blank' ? 'Page created' : `Created from "${template?.label}" template`,
      );
      setOpen(false);
      form.resetFields();
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
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
        New page
      </Button>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="New marketing page"
        okText="Create"
        onOk={onCreate}
        confirmLoading={submitting}
        width={680}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item
            name="title"
            label="Page title (internal)"
            rules={[{ required: true, message: 'Title is required' }]}
          >
            <Input placeholder="Black Friday landing" />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            tooltip="Route key without leading slash, e.g. 'black-friday' or 'legal/promo-terms'."
            rules={[
              { required: true, message: 'Slug is required' },
              {
                pattern: /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/,
                message: 'Lowercase letters, digits, dashes and slashes only.',
              },
            ]}
          >
            <Input addonBefore="/" placeholder="black-friday" />
          </Form.Item>

          <div style={{ marginTop: 4 }}>
            <Text strong style={{ fontSize: 13 }}>
              Start from
            </Text>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 6 }}>
              You can change anything after creating.
            </Text>
          </div>
          <div
            style={{
              marginTop: 10,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {PAGE_TEMPLATES.map((t) => {
              const active = t.key === templateKey;
              return (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setTemplateKey(t.key)}
                  style={{
                    textAlign: 'left',
                    background: active ? '#eef2ff' : '#f8fafc',
                    border: active ? '1px solid #6366f1' : '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                    {t.label}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 4, lineHeight: 1.6 }}>
                    {t.description}
                  </div>
                </button>
              );
            })}
          </div>
        </Form>
      </Modal>
    </>
  );
}
