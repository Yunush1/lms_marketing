/**
 * Shapes returned by the backend `/marketing/*` endpoints. Mirrors
 * backend/src/modules/marketing/marketing.seed.ts so the marketing site can
 * consume the API or fall back to its bundled seed without divergence.
 */

export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: { label: string; target: string };
    secondaryCta: { label: string; target: string };
    bullets: string[];
  };
  trustLogos: string[];
  layers: { icon: string; title: string; body: string; points: string[] }[];
  roleTabs: {
    key: string;
    label: string;
    headline: string;
    body: string;
    bullets: string[];
  }[];
  tour: { title: string; body: string; gradient: string }[];
  outcomes: { stat: string; label: string; detail: string }[];
  integrations: { name: string; tag: string }[];
  testimonials: { name: string; role: string; quote: string }[];
  faqIds: number[];
}

export interface SolutionContent {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  sections: { title: string; body: string }[];
  capabilities: { title: string; body: string; bullets: string[] }[];
  caseStudy?: {
    name: string;
    role: string;
    quote: string;
    metrics: { label: string; value: string }[];
  };
  cta: {
    primary: string;
    primaryTarget: string;
    secondary?: string;
    secondaryTarget?: string;
  };
}

export interface IntegrationContent {
  name: string;
  status: string;
  body: string;
  tag: string;
}

export interface CustomerContent {
  name: string;
  location: string;
  size: string;
  quote: string;
  metrics: { label: string; value: string }[];
}

export interface ChangelogEntry {
  date: string;
  kind: 'New' | 'Improved' | 'Fixed';
  title: string;
  body: string;
}

export interface MarketingPlanContent {
  tier: 'starter' | 'growth' | 'scale' | 'enterprise';
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number | null;
  currency: 'INR';
  maxStudents: number;
  maxStaff: number;
  maxSchools: number;
  highlights: string[];
  isPopular: boolean;
  ctaLabel: string;
  ctaTarget: string;
  contactSales: boolean;
}

export interface PlanFeatureRow {
  group: string;
  feature: string;
  starter: boolean | string;
  growth: boolean | string;
  scale: boolean | string;
  enterprise: boolean | string;
}

export interface MarketingPricing {
  plans: MarketingPlanContent[];
  featureMatrix: PlanFeatureRow[];
  faqs: { q: string; a: string }[];
}

// ── Blog post (subset of backend Blog entity) ──────────────────────────

export interface BlogPostMeta {
  title?: string;
  description?: string;
  image?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  [key: string]: unknown;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  isPublished: boolean;
  authorId?: string | null;
  metadata?: BlogPostMeta | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── CMS overrides (per-page SEO + content) ─────────────────────────────

export interface MarketingPageSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: string;
  noindex?: boolean;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export interface MarketingPage {
  id: string;
  slug: string;
  title: string;
  seo?: MarketingPageSEO | null;
  content?: Record<string, unknown> | null;
  bodyHtml?: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Lead capture (Contact form, Newsletter) ────────────────────────────

export interface LeadPayload {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  message?: string;
  source?: string;
}

export interface LeadResponse {
  status: boolean;
  message: string;
}
