/**
 * Block schema for the Phase-2 visual editor.
 *
 * A marketing page's structured content can be stored as `{ blocks: Block[] }`
 * inside the existing `marketing_pages.content` jsonb column. Pages that
 * carry blocks are rendered by the generic `/p/[slug]` route; legacy pages
 * (Home, Pricing, etc.) keep their bespoke layouts until they're migrated.
 *
 * To add a new block type:
 *   1. Add an interface here + extend the `Block` union.
 *   2. Register a default constructor in `createBlock()`.
 *   3. Add an editor panel under app/cms/(app)/pages/[id]/blocks/.
 *   4. Add a renderer under components/cms/render/.
 */

export type BlockType =
  | 'hero'
  | 'richText'
  | 'stats'
  | 'faq'
  | 'cta'
  | 'image'
  | 'form';

interface BaseBlock {
  /** Stable id used as React key + drag handle. Generated client-side. */
  id: string;
  type: BlockType;
}

/**
 * Reference to a `media_assets` row. We store the resolved URL + alt
 * inline (not just the id) so the public renderer doesn't need a CMS
 * fetch — and so an asset deletion turns into a broken image instead of
 * a missing block. The id is kept so the editor knows which asset is
 * pinned, for picker UIs that highlight the current selection.
 */
export interface MediaRef {
  id: string;
  url: string;
  alt: string;
  focalX?: number;
  focalY?: number;
}

export interface HeroBlock extends BaseBlock {
  type: 'hero';
  eyebrow?: string;
  /** Use \n for a manual line break. */
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; target: string };
  secondaryCta?: { label: string; target: string };
  /** Short checklist shown under the buttons (e.g. "No card required"). */
  bullets?: string[];
  /** Visual treatment. `gradient` matches the existing home hero. */
  background?: 'plain' | 'gradient' | 'dark';
  /** Optional accompanying visual. When present, the hero switches to a
   *  two-column layout (copy left, image right). */
  image?: MediaRef;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  image: MediaRef;
  caption?: string;
  /** Constrains the rendered image — `full` spans the wrap, `narrow`
   *  matches the prose column. */
  width?: 'narrow' | 'wide' | 'full';
}

/** What kind of `<input>` the field renders as. */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox';

/**
 * How a form field maps onto the backend leads endpoint. Standard
 * mappings populate the corresponding column on the `leads` row;
 * `custom` fields are appended to the message body so admins still
 * see everything the visitor entered.
 */
export type FormFieldMapping =
  | 'name'
  | 'email'
  | 'phone'
  | 'organization'
  | 'message'
  | 'custom';

export interface FormField {
  id: string;
  /** Submission key (machine-readable, snake_case). */
  name: string;
  /** Display label rendered next to the input. */
  label: string;
  type: FormFieldType;
  /** Where this value lands on the lead. */
  mapping: FormFieldMapping;
  required?: boolean;
  placeholder?: string;
  /** Comma-separated values for select / radio (`a,b,c`). */
  options?: string;
  /** Half-width vs. full-width layout slot. Half-width fields pair up
   *  on wide screens. */
  half?: boolean;
}

export interface FormBlock extends BaseBlock {
  type: 'form';
  heading?: string;
  subheading?: string;
  fields: FormField[];
  submitLabel: string;
  /** Toast / inline message shown after a successful submit. */
  successMessage: string;
  /**
   * Where to send the data. Defaults to the bundled leads endpoint;
   * setting this lets editors point the form at a custom URL (Zapier,
   * an internal webhook, …) that accepts the same JSON shape.
   */
  endpoint?: string;
  /** Free-form tag passed through as `source` on the lead — lets sales
   *  filter by which page produced the lead. */
  source?: string;
}

export interface RichTextBlock extends BaseBlock {
  type: 'richText';
  /** Sanitised HTML produced by the rich-text editor (Phase 2 ships a
   *  textarea; Phase 6 swaps in TipTap). */
  html: string;
  /** Constrains the prose column width. */
  width?: 'narrow' | 'wide';
}

export interface StatsBlock extends BaseBlock {
  type: 'stats';
  heading?: string;
  items: { stat: string; label: string; detail?: string }[];
  /** `dark` paints a deep-slate band — matches the home outcomes section. */
  variant?: 'light' | 'dark';
}

export interface FaqBlock extends BaseBlock {
  type: 'faq';
  heading?: string;
  items: { q: string; a: string }[];
}

export interface CtaBlock extends BaseBlock {
  type: 'cta';
  title: string;
  subtitle?: string;
  primary: { label: string; target: string };
  secondary?: { label: string; target: string };
  variant?: 'brand' | 'dark';
}

export type Block =
  | HeroBlock
  | RichTextBlock
  | StatsBlock
  | FaqBlock
  | CtaBlock
  | ImageBlock
  | FormBlock;

export interface BlocksContent {
  /** Discriminator so the renderer can switch on `content.kind === 'blocks'`
   *  without false-positives on legacy slug-shaped content (which uses
   *  `hero`/`layers`/etc. at the top level). */
  kind: 'blocks';
  blocks: Block[];
}

/** Helper: tells the renderer/editor whether this row uses the new schema. */
export function isBlocksContent(value: unknown): value is BlocksContent {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { kind?: string }).kind === 'blocks' &&
    Array.isArray((value as { blocks?: unknown }).blocks)
  );
}

/** Human-readable label used in the picker / sidebar. */
export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero',
  richText: 'Rich text',
  stats: 'Stats grid',
  faq: 'FAQ',
  cta: 'Call to action',
  image: 'Image',
  form: 'Form',
};

/** Short description shown under the label in the "Add block" picker. */
export const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
  hero: 'Big eyebrow + title + subtitle + CTAs at the top of a page.',
  richText: 'Free-form prose. Good for legal copy, About paragraphs.',
  stats: 'Three or four numbers with labels — outcomes, milestones.',
  faq: 'Collapsible question/answer list.',
  cta: 'Bordered band with one or two action buttons.',
  image: 'A single image with an optional caption.',
  form: 'Lead-capture form — design any combination of fields.',
};

/** Default block factory. Generates a stable id and sensible empty fields. */
export function createBlock(type: BlockType): Block {
  const id = makeId();
  switch (type) {
    case 'hero':
      return {
        id,
        type: 'hero',
        eyebrow: '',
        title: 'New hero',
        subtitle: '',
        bullets: [],
        background: 'gradient',
      };
    case 'richText':
      return { id, type: 'richText', html: '<p></p>', width: 'narrow' };
    case 'stats':
      return {
        id,
        type: 'stats',
        heading: '',
        items: [{ stat: '0', label: '' }],
        variant: 'light',
      };
    case 'faq':
      return { id, type: 'faq', heading: 'Frequently asked questions', items: [{ q: '', a: '' }] };
    case 'cta':
      return {
        id,
        type: 'cta',
        title: 'Ready to get started?',
        subtitle: '',
        primary: { label: 'Get started', target: '/register' },
        variant: 'brand',
      };
    case 'image':
      return {
        id,
        type: 'image',
        // Placeholder MediaRef; the picker fills it on first edit. The
        // renderer guards on `image.url` so an unfilled block doesn't
        // crash the page.
        image: { id: '', url: '', alt: '' },
        caption: '',
        width: 'wide',
      };
    case 'form':
      // Ship with a sensible default: a name + email pair, both
      // required, mapped onto the standard leads columns. Editors can
      // add / remove / rename fields freely from there.
      return {
        id,
        type: 'form',
        heading: 'Get in touch',
        subheading: 'We typically reply within one business day.',
        fields: [
          {
            id: makeId(),
            name: 'name',
            label: 'Full name',
            type: 'text',
            mapping: 'name',
            required: true,
            half: true,
          },
          {
            id: makeId(),
            name: 'email',
            label: 'Work email',
            type: 'email',
            mapping: 'email',
            required: true,
            half: true,
          },
          {
            id: makeId(),
            name: 'message',
            label: 'How can we help?',
            type: 'textarea',
            mapping: 'message',
            required: false,
          },
        ],
        submitLabel: 'Send message',
        successMessage: "Thanks — we'll be in touch shortly.",
        source: 'page-form',
      };
  }
}

/** Cheap-and-cheerful client-side id. Not security-sensitive. */
function makeId(): string {
  // Prefer crypto.randomUUID where available; fall back for very old envs.
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `b_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
