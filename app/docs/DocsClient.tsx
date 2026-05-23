'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Collapse, Empty, Input, Row, Tag } from 'antd';
import { App as AntApp } from 'antd';
import { SearchOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import type { DocSection } from '@/data/marketing';
import { logEvent, useTrackPageview } from '@/lib/audit';
import { docFeedbackApi } from '@/lib/api';

interface Props {
  docs: DocSection[];
}

const wrap: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 20px' };

export function DocsClient({ docs }: Props) {
  useTrackPageview('viewed_docs');
  const { message } = AntApp.useApp();
  const [query, setQuery] = useState('');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!activeSlug && docs.length) setActiveSlug(docs[0].slug);
  }, [docs, activeSlug]);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs
      .map((d) => ({
        ...d,
        items: d.items.filter(
          (it) =>
            it.q.toLowerCase().includes(q) ||
            it.a.replace(/<[^>]+>/g, ' ').toLowerCase().includes(q),
        ),
      }))
      .filter((d) => d.items.length > 0);
  }, [docs, query]);

  const active = filteredSections.find((d) => d.slug === activeSlug) ?? filteredSections[0] ?? null;

  const recordHelpful = (slug: string, question: string, helpful: boolean) => {
    logEvent({ event: 'doc_feedback', entityId: slug, metadata: { question, helpful } });
    docFeedbackApi.record(slug, question, helpful);
    message.success(helpful ? 'Thanks — glad it helped.' : 'Thanks — we’ll improve this.');
  };

  return (
    <>
      <section style={{ padding: '56px 0 24px' }}>
        <div style={wrap}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Documentation
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginTop: 12, marginBottom: 18 }}>
            Guides to get your school up and running fast.
          </p>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search docs"
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ maxWidth: 360 }}
            size="large"
          />
        </div>
      </section>

      <section style={{ paddingBottom: 80 }}>
        <div style={wrap}>
          {filteredSections.length === 0 ? (
            <Empty description="No docs match your search yet." />
          ) : (
            <Row gutter={[20, 20]}>
              <Col xs={24} md={7}>
                <Card variant="borderless" style={{ borderRadius: 14, position: 'sticky', top: 84 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.04, marginBottom: 10 }}>
                    Sections
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {filteredSections.map((d) => {
                      const isActive = d.slug === activeSlug;
                      return (
                        <button
                          key={d.slug}
                          type="button"
                          onClick={() => setActiveSlug(d.slug)}
                          style={{
                            textAlign: 'left',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px 12px',
                            borderRadius: 8,
                            background: isActive ? '#eef2ff' : 'transparent',
                            color: isActive ? '#4f46e5' : '#0f172a',
                            fontWeight: isActive ? 700 : 500,
                            fontSize: 14,
                          }}
                        >
                          {d.title}
                          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                            {d.items.length} {d.items.length === 1 ? 'topic' : 'topics'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={17}>
                {active && (
                  <Card variant="borderless" style={{ borderRadius: 14 }}>
                    <div style={{ marginBottom: 16 }}>
                      <Tag color="blue">{active.slug}</Tag>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
                        {active.title}
                      </h2>
                      <div style={{ color: '#64748b', fontSize: 14 }}>{active.summary}</div>
                    </div>

                    <Collapse
                      bordered={false}
                      onChange={(keys) => {
                        const open = Array.isArray(keys) ? keys : [keys];
                        for (const k of open) {
                          const idx = Number(String(k).split('-').pop());
                          const q = active.items[idx]?.q;
                          if (q) {
                            logEvent({
                              event: 'opened_doc_section',
                              entityId: active.slug,
                              metadata: { question: q, docTitle: active.title },
                            });
                          }
                        }
                      }}
                      items={active.items.map((it, i) => ({
                        key: `${active.slug}-${i}`,
                        label: it.q,
                        children: (
                          <>
                            {/* Answers are rich HTML authored by platform staff (trusted super/district admins). */}
                            <div
                              className="prose"
                              style={{ color: '#475569', lineHeight: 1.8 }}
                              dangerouslySetInnerHTML={{ __html: it.a }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 12, borderTop: '1px dashed #e2e8f0' }}>
                              <span style={{ fontSize: 13, color: '#64748b' }}>Was this helpful?</span>
                              <Button size="small" icon={<LikeOutlined />} onClick={() => recordHelpful(active.slug, it.q, true)}>Yes</Button>
                              <Button size="small" icon={<DislikeOutlined />} onClick={() => recordHelpful(active.slug, it.q, false)}>No</Button>
                            </div>
                          </>
                        ),
                      }))}
                    />
                  </Card>
                )}
              </Col>
            </Row>
          )}
        </div>
      </section>
    </>
  );
}
