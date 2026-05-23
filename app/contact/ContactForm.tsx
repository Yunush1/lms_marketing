'use client';

import { Button, Col, Form, Input, Result, Row } from 'antd';
import { useSubmitLead } from '@/hooks/useSubmitLead';
import { logEvent, useTrackPageview } from '@/lib/audit';

interface ContactValues {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message?: string;
}

export function ContactForm() {
  useTrackPageview('viewed_contact');
  const [form] = Form.useForm<ContactValues>();
  const submit = useSubmitLead();

  const onFinish = async (values: ContactValues) => {
    await submit.mutateAsync({ ...values, source: 'contact' });
    logEvent({
      event: 'submitted_contact_form',
      metadata: {
        organization: values.organization,
        hasMessage: !!values.message,
      },
    });
    form.resetFields();
  };

  if (submit.isSuccess) {
    return (
      <Result
        status="success"
        title="Thanks — we've got your details"
        subTitle="Our sales team will reach out shortly."
        extra={
          <Button type="primary" onClick={() => submit.reset()}>
            Send another message
          </Button>
        }
      />
    );
  }

  return (
    <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish}>
      <Row gutter={12}>
        <Col xs={24} sm={12}>
          <Form.Item name="name" label="Full name" rules={[{ required: true, min: 2 }]}>
            <Input placeholder="Jane Doe" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Work email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="jane@school.edu" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="+91 …" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="organization" label="School / organisation">
            <Input placeholder="Greenwood High" size="large" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="message" label="How can we help?">
        <Input.TextArea rows={4} placeholder="We have ~800 students across 2 campuses…" />
      </Form.Item>
      <Button
        type="primary"
        size="large"
        htmlType="submit"
        loading={submit.isPending}
        block
      >
        Send message
      </Button>
    </Form>
  );
}
