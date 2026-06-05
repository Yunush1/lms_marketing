/**
 * Pre-built block sequences that jump-start a new page. Editors pick
 * one in the "New page" modal; the picker calls `instantiateTemplate()`
 * to materialise the blocks with fresh ids and hands the result to the
 * backend as `content.blocks`.
 *
 * Adding a template:
 *   1. Append a definition to `PAGE_TEMPLATES`.
 *   2. The picker re-renders automatically — no other wiring needed.
 */
import type { Block, BlockType } from './blocks';

/** Helper: stable random id per template invocation. */
function makeId(): string {
  const c = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `b_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Editor-facing template metadata + raw block factory. */
export interface PageTemplate {
  key: string;
  label: string;
  description: string;
  /** Coarse category — drives the filter chips in the gallery. */
  category: 'general' | 'marketing' | 'sales' | 'company' | 'events';
  /** Suggested slug placeholder for the modal. */
  suggestedSlug: string;
  /**
   * CSS gradient used as the card cover. The mini-layout preview is
   * drawn on top of this, so it doubles as a visual identity for the
   * template — pick something on-brand.
   */
  coverGradient: string;
  /** Build blocks fresh each time it's chosen — ids must be unique
   *  across the page so we generate them on every call. */
  build: () => Block[];
}

// ─── Templates ─────────────────────────────────────────────────────────

/**
 * Blank — explicit so the picker can offer it as a first-class option.
 */
function blank(): Block[] {
  return [];
}

/**
 * Landing — single goal page. Hero → outcomes → social proof → CTA.
 */
function landing(): Block[] {
  return [
    {
      id: makeId(),
      type: 'hero',
      eyebrow: 'New',
      title: 'A bold promise\nin two lines.',
      subtitle: 'A one-sentence elevator pitch that explains the value and who it’s for.',
      primaryCta: { label: 'Start free', target: '/register' },
      secondaryCta: { label: 'Book a demo', target: '/contact?intent=demo' },
      bullets: ['No card required', '14-day trial', 'Cancel anytime'],
      background: 'gradient',
    },
    {
      id: makeId(),
      type: 'stats',
      heading: 'Outcomes our customers see',
      variant: 'dark',
      items: [
        { stat: '60%', label: 'less time on follow-ups', detail: 'After one quarter.' },
        { stat: '40%', label: 'higher engagement', detail: 'Across pilot cohorts.' },
        { stat: '1 day', label: 'average onboarding', detail: 'From signup to first action.' },
      ],
    },
    {
      id: makeId(),
      type: 'richText',
      width: 'narrow',
      html: '<h2>Why teams switch</h2><p>Two short paragraphs covering the most common motivation. Replace this copy with words from a real customer interview — specifics outsell adjectives.</p>',
    },
    {
      id: makeId(),
      type: 'cta',
      title: 'Ready to try it?',
      subtitle: 'Free for the first month. No card required.',
      primary: { label: 'Get started', target: '/register' },
      secondary: { label: 'Talk to sales', target: '/contact' },
      variant: 'brand',
    },
  ];
}

/**
 * About — story + numbers + values + ask.
 */
function about(): Block[] {
  return [
    {
      id: makeId(),
      type: 'hero',
      title: 'We build software\nteams actually enjoy.',
      subtitle:
        'Two sentences on origin + mission. Replace with the team’s own story so it doesn’t read like a stock template.',
      background: 'plain',
    },
    {
      id: makeId(),
      type: 'stats',
      variant: 'light',
      items: [
        { stat: '120+', label: 'Schools onboarded' },
        { stat: '85k+', label: 'Students managed' },
        { stat: '99.9%', label: 'Uptime' },
        { stat: '1 day', label: 'Avg. onboarding' },
      ],
    },
    {
      id: makeId(),
      type: 'richText',
      width: 'narrow',
      html: '<h2>What we believe</h2><ul><li><strong>Tenant isolation is non-negotiable.</strong> Every query is scoped to the school in the user’s JWT.</li><li><strong>Software should fade into the background.</strong> Two taps to mark attendance.</li><li><strong>Schools deserve real support.</strong> Real humans, not ticket queues.</li></ul>',
    },
    {
      id: makeId(),
      type: 'cta',
      title: 'Want a closer look?',
      subtitle: 'Tell us about your school and we’ll tailor the demo.',
      primary: { label: 'Book a demo', target: '/contact?intent=demo' },
      variant: 'dark',
    },
  ];
}

/**
 * Contact — short hero + a form. The form ships with name + email +
 * message wired to the leads endpoint, so it works out of the box.
 */
function contact(): Block[] {
  return [
    {
      id: makeId(),
      type: 'hero',
      title: 'Talk to our team',
      subtitle: 'Tell us about your school and we’ll reach out within one business day.',
      background: 'plain',
    },
    {
      id: makeId(),
      type: 'form',
      heading: 'Send us a note',
      subheading: 'All fields are optional unless marked otherwise.',
      submitLabel: 'Send message',
      successMessage: 'Thanks — we’ll be in touch shortly.',
      source: 'contact-page',
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
          name: 'organization',
          label: 'School / organisation',
          type: 'text',
          mapping: 'organization',
          half: true,
        },
        {
          id: makeId(),
          name: 'phone',
          label: 'Phone',
          type: 'tel',
          mapping: 'phone',
          half: true,
        },
        {
          id: makeId(),
          name: 'role',
          label: 'Your role',
          type: 'select',
          mapping: 'custom',
          options: 'Principal, Admin, Teacher, IT, Parent, Other',
          half: false,
        },
        {
          id: makeId(),
          name: 'message',
          label: 'How can we help?',
          type: 'textarea',
          mapping: 'message',
        },
      ],
    },
  ];
}

/**
 * Pricing teaser — hero + outcomes + FAQs + CTA. Keeps the real Pricing
 * page bespoke; this template is for marketing campaigns / promos.
 */
function pricingTeaser(): Block[] {
  return [
    {
      id: makeId(),
      type: 'hero',
      eyebrow: 'Pricing',
      title: 'One platform.\nPredictable pricing.',
      subtitle:
        'Three sentences positioning the offer + who the plans fit. Lead with the lowest-friction tier.',
      primaryCta: { label: 'Start free', target: '/register' },
      secondaryCta: { label: 'See full pricing', target: '/pricing' },
      background: 'gradient',
    },
    {
      id: makeId(),
      type: 'stats',
      variant: 'light',
      items: [
        { stat: '$0', label: 'Free tier', detail: 'Up to 50 students.' },
        { stat: '14 d', label: 'Trial on paid plans', detail: 'No card needed.' },
        { stat: '20%', label: 'Annual discount', detail: 'Versus monthly.' },
      ],
    },
    {
      id: makeId(),
      type: 'faq',
      heading: 'Common pricing questions',
      items: [
        {
          q: 'What counts as a student?',
          a: 'Any active enrollment in the current academic year. Inactive / graduated students don’t count.',
        },
        {
          q: 'Can I switch plans?',
          a: 'Yes — upgrade or downgrade at any time. Prorated credit applies on upgrades.',
        },
        {
          q: 'What happens when my plan expires?',
          a: 'Staff write-access pauses; students and parents keep read-only access so the school keeps running.',
        },
      ],
    },
    {
      id: makeId(),
      type: 'cta',
      title: 'Have a special situation?',
      subtitle: 'Non-profit, district, or enterprise? Talk to sales for a tailored quote.',
      primary: { label: 'Talk to sales', target: '/contact?intent=enterprise' },
      variant: 'brand',
    },
  ];
}

// ─── Registry ──────────────────────────────────────────────────────────

/**
 * Event / webinar landing — date callout, agenda, signup form.
 */
function event(): Block[] {
  return [
    {
      id: makeId(),
      type: 'hero',
      eyebrow: 'Live · Sept 12, 2026',
      title: 'AI in the classroom\n— what works, what doesn’t.',
      subtitle:
        'A 45-minute deep-dive for school principals. Two case studies, a live Q&A, and the playbook to take home.',
      primaryCta: { label: 'Save my seat', target: '#signup' },
      secondaryCta: { label: 'View agenda', target: '#agenda' },
      bullets: ['Free to attend', 'Recording available', 'Q&A with our team'],
      background: 'dark',
    },
    {
      id: makeId(),
      type: 'stats',
      heading: 'Why teams attend',
      variant: 'light',
      items: [
        { stat: '45m', label: 'Live session', detail: 'Plus 15 minutes of Q&A.' },
        { stat: '2', label: 'Real case studies', detail: 'From schools running on the platform.' },
        { stat: 'Free', label: 'No catch', detail: 'Recording sent to all registrants.' },
      ],
    },
    {
      id: makeId(),
      type: 'richText',
      width: 'narrow',
      html: '<h2 id="agenda">Agenda</h2><ol><li><strong>Why AI now (5 min)</strong> — what changed in the last 18 months.</li><li><strong>Case studies (20 min)</strong> — two schools, two outcomes.</li><li><strong>Playbook (10 min)</strong> — a 30-day pilot you can copy.</li><li><strong>Q&A (10 min)</strong> — bring your questions.</li></ol>',
    },
    {
      id: makeId(),
      type: 'form',
      heading: 'Save your seat',
      subheading: 'We’ll email the calendar invite and the link to join.',
      submitLabel: 'Reserve my seat',
      successMessage: 'You’re in — check your inbox for the calendar invite.',
      source: 'event-signup',
      fields: [
        { id: makeId(), name: 'name', label: 'Full name', type: 'text', mapping: 'name', required: true, half: true },
        { id: makeId(), name: 'email', label: 'Email', type: 'email', mapping: 'email', required: true, half: true },
        { id: makeId(), name: 'organization', label: 'School', type: 'text', mapping: 'organization', half: true },
        { id: makeId(), name: 'role', label: 'Your role', type: 'select', mapping: 'custom', options: 'Principal, Admin, Teacher, IT, Other', half: true },
        { id: makeId(), name: 'question', label: 'Anything you’d like us to cover?', type: 'textarea', mapping: 'message' },
      ],
    },
  ];
}

/**
 * Product feature — image-led hero, FAQ, CTA. Used for sub-features
 * inside a marketing site (e.g. "Attendance", "Fees", "Reports").
 */
function feature(): Block[] {
  return [
    {
      id: makeId(),
      type: 'hero',
      eyebrow: 'Feature',
      title: 'Attendance\nin two taps.',
      subtitle:
        'Teachers mark attendance from a phone or a tablet. Parents see it instantly. Admins see the rollup.',
      primaryCta: { label: 'Start free', target: '/register' },
      secondaryCta: { label: 'See all features', target: '/pricing' },
      background: 'gradient',
      image: { id: '', url: '', alt: '' },
    },
    {
      id: makeId(),
      type: 'stats',
      variant: 'light',
      items: [
        { stat: '2 taps', label: 'To mark a class', detail: 'No login per session.' },
        { stat: 'Realtime', label: 'Parent updates', detail: 'In-app + email.' },
        { stat: '0 setup', label: 'For new teachers', detail: 'Defaults work out of the box.' },
      ],
    },
    {
      id: makeId(),
      type: 'faq',
      heading: 'Questions teachers ask',
      items: [
        { q: 'Can I mark attendance offline?', a: 'Yes — submissions queue locally and sync when you’re back online.' },
        { q: 'Can parents see attendance history?', a: 'Every parent sees their child’s record back to the start of the academic year.' },
        { q: 'Does the data flow into reports?', a: 'Attendance % feeds the principal dashboard and the per-student report card automatically.' },
      ],
    },
    {
      id: makeId(),
      type: 'cta',
      title: 'Try attendance free.',
      subtitle: 'Free for up to 50 students. No card required.',
      primary: { label: 'Get started', target: '/register' },
      secondary: { label: 'Book a demo', target: '/contact?intent=demo' },
      variant: 'brand',
    },
  ];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    key: 'blank',
    label: 'Blank',
    description: 'Start with no blocks and add what you need.',
    category: 'general',
    suggestedSlug: 'my-page',
    coverGradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    build: blank,
  },
  {
    key: 'landing',
    label: 'Landing page',
    description: 'Hero → outcomes → social proof → CTA. Great for ads + campaigns.',
    category: 'marketing',
    suggestedSlug: 'landing',
    coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    build: landing,
  },
  {
    key: 'about',
    label: 'About',
    description: 'Story + numbers + values + ask. Good for company / mission pages.',
    category: 'company',
    suggestedSlug: 'about-us',
    coverGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    build: about,
  },
  {
    key: 'contact',
    label: 'Contact',
    description: 'Short hero + lead-capture form wired to the leads endpoint.',
    category: 'sales',
    suggestedSlug: 'get-in-touch',
    coverGradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
    build: contact,
  },
  {
    key: 'pricing-teaser',
    label: 'Pricing teaser',
    description: 'Pricing-style block layout for promos. Real Pricing page stays bespoke.',
    category: 'sales',
    suggestedSlug: 'plans',
    coverGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    build: pricingTeaser,
  },
  {
    key: 'event',
    label: 'Event / webinar',
    description: 'Date callout, agenda, signup form. Built for a single-day live session.',
    category: 'events',
    suggestedSlug: 'webinar',
    coverGradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    build: event,
  },
  {
    key: 'feature',
    label: 'Product feature',
    description: 'Image-led hero, outcomes, FAQ, CTA. For deep-link feature pages.',
    category: 'marketing',
    suggestedSlug: 'feature',
    coverGradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    build: feature,
  },
];

/** Look up a template by key — used by the New Page modal on submit. */
export function findTemplate(key: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.key === key);
}

/** Re-export the block-type union so picker tooling can introspect it. */
export type { BlockType };
