'use client';

import React from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type {
  Block,
  CtaBlock,
  FaqBlock,
  FormBlock,
  FormField,
  FormFieldMapping,
  FormFieldType,
  HeroBlock,
  ImageBlock,
  RichTextBlock,
  StatsBlock,
} from '@/lib/blocks';
import { BLOCK_LABELS } from '@/lib/blocks';
import { MediaPicker } from '@/components/cms/media/MediaPicker';

const { TextArea } = Input;
const { Text } = Typography;

interface BlockPanelProps {
  block: Block;
  /** Called with the updated block whenever any field changes. */
  onChange: (next: Block) => void;
}

/**
 * Single-block editor. Type-discriminates on `block.type` and renders the
 * matching field set. Lives inside the page editor's right-hand pane.
 */
export function BlockPanel({ block, onChange }: BlockPanelProps) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.06 }}>
        Editing · {BLOCK_LABELS[block.type]}
      </Text>
      <Divider style={{ margin: '8px 0 16px' }} />
      {block.type === 'hero' && <HeroFields block={block} onChange={onChange} />}
      {block.type === 'richText' && <RichTextFields block={block} onChange={onChange} />}
      {block.type === 'stats' && <StatsFields block={block} onChange={onChange} />}
      {block.type === 'faq' && <FaqFields block={block} onChange={onChange} />}
      {block.type === 'cta' && <CtaFields block={block} onChange={onChange} />}
      {block.type === 'image' && <ImageFields block={block} onChange={onChange} />}
      {block.type === 'form' && <FormFields block={block} onChange={onChange} />}
    </div>
  );
}

// ─── Generic helpers ───────────────────────────────────────────────────

/**
 * Single labelled field. We use plain controlled inputs (no AntD Form)
 * because the block editor needs to call back to its parent on every
 * keystroke — AntD Form fights us on that.
 */
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

/** Reorderable string list — used for hero bullets. */
function StringList({
  values,
  onChange,
  placeholder,
  addLabel,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  const update = (idx: number, v: string) => {
    const next = values.slice();
    next[idx] = v;
    onChange(next);
  };
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = values.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  return (
    <>
      {values.map((v, idx) => (
        <Space.Compact key={idx} style={{ width: '100%', marginBottom: 6 }}>
          <Input value={v} onChange={(e) => update(idx, e.target.value)} placeholder={placeholder} />
          <Button icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => move(idx, idx - 1)} />
          <Button
            icon={<ArrowDownOutlined />}
            disabled={idx === values.length - 1}
            onClick={() => move(idx, idx + 1)}
          />
          <Button icon={<DeleteOutlined />} danger onClick={() => remove(idx)} />
        </Space.Compact>
      ))}
      <Button block type="dashed" icon={<PlusOutlined />} onClick={() => onChange([...values, ''])}>
        {addLabel ?? 'Add item'}
      </Button>
    </>
  );
}

/** Generic object-list editor — renders one card per item with a callback
 *  that paints the item's fields. */
function ObjectList<T>({
  items,
  onChange,
  defaultItem,
  itemLabel,
  renderRow,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  defaultItem: T;
  itemLabel: string;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
}) {
  const update = (idx: number, patch: Partial<T>) => {
    const next = items.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };
  return (
    <>
      {items.map((item, idx) => (
        <Card
          key={idx}
          size="small"
          style={{ marginBottom: 10 }}
          title={
            <Text style={{ fontSize: 12 }}>
              {itemLabel} #{idx + 1}
            </Text>
          }
          extra={
            <Space>
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={idx === 0}
                onClick={() => move(idx, idx - 1)}
              />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={idx === items.length - 1}
                onClick={() => move(idx, idx + 1)}
              />
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(idx)} />
            </Space>
          }
        >
          {renderRow(item, (patch) => update(idx, patch))}
        </Card>
      ))}
      <Button
        block
        type="dashed"
        icon={<PlusOutlined />}
        onClick={() => onChange([...items, { ...defaultItem }])}
      >
        Add {itemLabel.toLowerCase()}
      </Button>
    </>
  );
}

// ─── Per-block field sets ──────────────────────────────────────────────

function HeroFields({ block, onChange }: { block: HeroBlock; onChange: (b: HeroBlock) => void }) {
  const patch = (p: Partial<HeroBlock>) => onChange({ ...block, ...p });
  const patchCta = (key: 'primaryCta' | 'secondaryCta', p: Partial<{ label: string; target: string }>) =>
    patch({ [key]: { label: '', target: '', ...block[key], ...p } } as Partial<HeroBlock>);

  return (
    <>
      <Field label="Eyebrow (small tag above title)">
        <Input value={block.eyebrow ?? ''} onChange={(e) => patch({ eyebrow: e.target.value })} />
      </Field>
      <Field label="Title" hint={'Use \\n for a manual line break.'}>
        <TextArea rows={2} value={block.title} onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <Field label="Subtitle">
        <TextArea
          rows={3}
          value={block.subtitle ?? ''}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>
      <Field label="Background">
        <Select
          value={block.background ?? 'gradient'}
          style={{ width: '100%' }}
          onChange={(v) => patch({ background: v })}
          options={[
            { label: 'Gradient (indigo)', value: 'gradient' },
            { label: 'Plain white', value: 'plain' },
            { label: 'Dark slate', value: 'dark' },
          ]}
        />
      </Field>

      <Divider>CTAs</Divider>
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Field label="Primary CTA label">
            <Input
              value={block.primaryCta?.label ?? ''}
              onChange={(e) => patchCta('primaryCta', { label: e.target.value })}
            />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Primary CTA target">
            <Input
              value={block.primaryCta?.target ?? ''}
              onChange={(e) => patchCta('primaryCta', { target: e.target.value })}
              placeholder="/register"
            />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Secondary CTA label">
            <Input
              value={block.secondaryCta?.label ?? ''}
              onChange={(e) => patchCta('secondaryCta', { label: e.target.value })}
            />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Secondary CTA target">
            <Input
              value={block.secondaryCta?.target ?? ''}
              onChange={(e) => patchCta('secondaryCta', { target: e.target.value })}
            />
          </Field>
        </Col>
      </Row>

      <Divider>Hero bullets</Divider>
      <StringList
        values={block.bullets ?? []}
        onChange={(v) => patch({ bullets: v })}
        placeholder="No card required"
        addLabel="Add bullet"
      />

      <Divider>Hero image (optional)</Divider>
      <MediaPicker
        label="Side image — shown to the right of the hero copy"
        value={block.image}
        onChange={(image) => patch({ image })}
      />
    </>
  );
}

function ImageFields({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (b: ImageBlock) => void;
}) {
  const patch = (p: Partial<ImageBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <MediaPicker
        label="Image"
        value={block.image.url ? block.image : undefined}
        onChange={(image) =>
          patch({ image: image ?? { id: '', url: '', alt: '' } })
        }
        allowRemove={false}
      />
      <Field label="Caption (optional)">
        <Input value={block.caption ?? ''} onChange={(e) => patch({ caption: e.target.value })} />
      </Field>
      <Field label="Column width">
        <Select
          value={block.width ?? 'wide'}
          style={{ width: '100%' }}
          onChange={(v) => patch({ width: v })}
          options={[
            { label: 'Narrow (matches prose)', value: 'narrow' },
            { label: 'Wide (1100 px)', value: 'wide' },
            { label: 'Full width', value: 'full' },
          ]}
        />
      </Field>
    </>
  );
}

function RichTextFields({
  block,
  onChange,
}: {
  block: RichTextBlock;
  onChange: (b: RichTextBlock) => void;
}) {
  const patch = (p: Partial<RichTextBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <Field label="Content (HTML)" hint="Phase 6 swaps this textarea for a Tiptap WYSIWYG.">
        <TextArea
          rows={14}
          value={block.html}
          onChange={(e) => patch({ html: e.target.value })}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      </Field>
      <Field label="Column width">
        <Select
          value={block.width ?? 'narrow'}
          style={{ width: '100%' }}
          onChange={(v) => patch({ width: v })}
          options={[
            { label: 'Narrow (prose, 820 px)', value: 'narrow' },
            { label: 'Wide (1100 px)', value: 'wide' },
          ]}
        />
      </Field>
    </>
  );
}

function StatsFields({
  block,
  onChange,
}: {
  block: StatsBlock;
  onChange: (b: StatsBlock) => void;
}) {
  const patch = (p: Partial<StatsBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <Field label="Section heading (optional)">
        <Input value={block.heading ?? ''} onChange={(e) => patch({ heading: e.target.value })} />
      </Field>
      <Field label="Variant">
        <Select
          value={block.variant ?? 'light'}
          style={{ width: '100%' }}
          onChange={(v) => patch({ variant: v })}
          options={[
            { label: 'Light background', value: 'light' },
            { label: 'Dark band (outcomes-style)', value: 'dark' },
          ]}
        />
      </Field>
      <Divider>Stats</Divider>
      <ObjectList
        items={block.items}
        onChange={(items) => patch({ items })}
        defaultItem={{ stat: '', label: '', detail: '' }}
        itemLabel="Stat"
        renderRow={(item, update) => (
          <>
            <Row gutter={12}>
              <Col xs={24} md={6}>
                <Field label="Stat">
                  <Input value={item.stat} onChange={(e) => update({ stat: e.target.value })} placeholder="60%" />
                </Field>
              </Col>
              <Col xs={24} md={18}>
                <Field label="Label">
                  <Input
                    value={item.label}
                    onChange={(e) => update({ label: e.target.value })}
                    placeholder="less time on fee follow-ups"
                  />
                </Field>
              </Col>
            </Row>
            <Field label="Detail (optional)">
              <Input value={item.detail ?? ''} onChange={(e) => update({ detail: e.target.value })} />
            </Field>
          </>
        )}
      />
    </>
  );
}

function FaqFields({ block, onChange }: { block: FaqBlock; onChange: (b: FaqBlock) => void }) {
  const patch = (p: Partial<FaqBlock>) => onChange({ ...block, ...p });
  return (
    <>
      <Field label="Heading (optional)">
        <Input value={block.heading ?? ''} onChange={(e) => patch({ heading: e.target.value })} />
      </Field>
      <Divider>Questions</Divider>
      <ObjectList
        items={block.items}
        onChange={(items) => patch({ items })}
        defaultItem={{ q: '', a: '' }}
        itemLabel="FAQ"
        renderRow={(item, update) => (
          <>
            <Field label="Question">
              <Input value={item.q} onChange={(e) => update({ q: e.target.value })} />
            </Field>
            <Field label="Answer">
              <TextArea rows={3} value={item.a} onChange={(e) => update({ a: e.target.value })} />
            </Field>
          </>
        )}
      />
    </>
  );
}

function CtaFields({ block, onChange }: { block: CtaBlock; onChange: (b: CtaBlock) => void }) {
  const patch = (p: Partial<CtaBlock>) => onChange({ ...block, ...p });
  const patchPrimary = (p: Partial<{ label: string; target: string }>) =>
    patch({ primary: { ...block.primary, ...p } });
  const patchSecondary = (p: Partial<{ label: string; target: string }>) =>
    patch({ secondary: { label: '', target: '', ...block.secondary, ...p } });
  return (
    <>
      <Field label="Title">
        <Input value={block.title} onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <Field label="Subtitle (optional)">
        <TextArea rows={2} value={block.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} />
      </Field>
      <Field label="Variant">
        <Select
          value={block.variant ?? 'brand'}
          style={{ width: '100%' }}
          onChange={(v) => patch({ variant: v })}
          options={[
            { label: 'Brand (indigo)', value: 'brand' },
            { label: 'Dark slate', value: 'dark' },
          ]}
        />
      </Field>
      <Divider>Buttons</Divider>
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Field label="Primary label">
            <Input value={block.primary.label} onChange={(e) => patchPrimary({ label: e.target.value })} />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Primary target">
            <Input value={block.primary.target} onChange={(e) => patchPrimary({ target: e.target.value })} />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Secondary label">
            <Input
              value={block.secondary?.label ?? ''}
              onChange={(e) => patchSecondary({ label: e.target.value })}
            />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Secondary target">
            <Input
              value={block.secondary?.target ?? ''}
              onChange={(e) => patchSecondary({ target: e.target.value })}
            />
          </Field>
        </Col>
      </Row>
    </>
  );
}

// ─── Form block editor ────────────────────────────────────────────────

const FIELD_TYPE_OPTIONS: { label: string; value: FormFieldType }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'tel' },
  { label: 'URL', value: 'url' },
  { label: 'Number', value: 'number' },
  { label: 'Long text', value: 'textarea' },
  { label: 'Dropdown', value: 'select' },
  { label: 'Checkbox', value: 'checkbox' },
];

const FIELD_MAPPING_OPTIONS: { label: string; value: FormFieldMapping }[] = [
  { label: 'Name', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Organization', value: 'organization' },
  { label: 'Message', value: 'message' },
  { label: 'Custom (appended to message)', value: 'custom' },
];

/** Slugify a label into a safe submission key (snake_case). */
function toSubmissionKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

function FormFields({ block, onChange }: { block: FormBlock; onChange: (b: FormBlock) => void }) {
  const patch = (p: Partial<FormBlock>) => onChange({ ...block, ...p });
  const setFields = (fields: FormField[]) => patch({ fields });

  return (
    <>
      <Divider orientation="left">Form header</Divider>
      <Field label="Heading">
        <Input value={block.heading ?? ''} onChange={(e) => patch({ heading: e.target.value })} />
      </Field>
      <Field label="Subheading">
        <TextArea
          rows={2}
          value={block.subheading ?? ''}
          onChange={(e) => patch({ subheading: e.target.value })}
        />
      </Field>

      <Divider orientation="left">Fields</Divider>
      <ObjectList<FormField>
        items={block.fields}
        onChange={setFields}
        defaultItem={{
          id: '',
          name: '',
          label: '',
          type: 'text',
          mapping: 'custom',
          required: false,
        }}
        itemLabel="Field"
        renderRow={(f, update) => (
          <>
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Field label="Label">
                  <Input
                    value={f.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      // Keep the submission key in sync until the editor
                      // explicitly customises it — match the WordPress
                      // "slug auto-fills from title" feel.
                      const auto = toSubmissionKey(f.label) === f.name || !f.name;
                      update({
                        label,
                        ...(auto ? { name: toSubmissionKey(label) } : {}),
                      });
                    }}
                    placeholder="Full name"
                  />
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field label="Submission key">
                  <Input
                    value={f.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="full_name"
                  />
                </Field>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col xs={24} md={10}>
                <Field label="Type">
                  <Select
                    value={f.type}
                    style={{ width: '100%' }}
                    options={FIELD_TYPE_OPTIONS}
                    onChange={(v) => update({ type: v })}
                  />
                </Field>
              </Col>
              <Col xs={24} md={10}>
                <Field label="Maps to lead field">
                  <Select
                    value={f.mapping}
                    style={{ width: '100%' }}
                    options={FIELD_MAPPING_OPTIONS}
                    onChange={(v) => update({ mapping: v })}
                  />
                </Field>
              </Col>
              <Col xs={12} md={2}>
                <Field label="Req">
                  <Switch
                    checked={!!f.required}
                    onChange={(v) => update({ required: v })}
                  />
                </Field>
              </Col>
              <Col xs={12} md={2}>
                <Field label="Half">
                  <Switch checked={!!f.half} onChange={(v) => update({ half: v })} />
                </Field>
              </Col>
            </Row>
            {(f.type === 'select') && (
              <Field
                label="Options (comma-separated)"
                hint="Each value becomes one menu item."
              >
                <Input
                  value={f.options ?? ''}
                  onChange={(e) => update({ options: e.target.value })}
                  placeholder="K-12 school, Coaching centre, Multi-campus group"
                />
              </Field>
            )}
            <Field label="Placeholder">
              <Input
                value={f.placeholder ?? ''}
                onChange={(e) => update({ placeholder: e.target.value })}
                placeholder="Jane Doe"
              />
            </Field>
          </>
        )}
      />

      <Divider orientation="left">Submit + delivery</Divider>
      <Row gutter={12}>
        <Col xs={24} md={12}>
          <Field label="Submit button label">
            <Input
              value={block.submitLabel}
              onChange={(e) => patch({ submitLabel: e.target.value })}
            />
          </Field>
        </Col>
        <Col xs={24} md={12}>
          <Field label="Source tag" hint="Used on the lead to filter where it came from.">
            <Input
              value={block.source ?? ''}
              onChange={(e) => patch({ source: e.target.value })}
              placeholder="contact-page"
            />
          </Field>
        </Col>
      </Row>
      <Field label="Success message">
        <TextArea
          rows={2}
          value={block.successMessage}
          onChange={(e) => patch({ successMessage: e.target.value })}
        />
      </Field>
      <Field
        label="Custom endpoint URL (optional)"
        hint="Defaults to the bundled leads endpoint. Use to forward to Zapier, an internal webhook, etc."
      >
        <Input
          value={block.endpoint ?? ''}
          onChange={(e) => patch({ endpoint: e.target.value })}
          placeholder="https://hooks.zapier.com/…"
        />
      </Field>
    </>
  );
}
