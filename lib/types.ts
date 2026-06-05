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

// ── Static-page content shapes (About / Contact / Security / Legal) ───
//
// These slugs are stored as CMS rows on `/marketing/pages/public/:slug`
// (via marketingApi.getPage). The page reads `MarketingPage.content` and
// merges over its bundled fallback, so an admin override of *one* field
// still keeps the rest of the page intact.

export interface AboutContent {
  hero: {
    title: string;
    intro: string;
    body?: string;
  };
  stats: { label: string; value: string }[];
  beliefsHeading?: string;
  beliefs: { strong: string; rest: string }[];
  ctas: { label: string; target: string; primary?: boolean }[];
}

export interface ContactContent {
  hero: {
    title: string;
    subtitle: string;
  };
  channels: {
    email?: string;
    phone?: string;
    address?: string;
    /** Free-form text under the channel list (e.g. "Prefer a demo?…"). */
    hint?: string;
  };
}

export interface SecurityContent {
  hero: {
    eyebrow: string;
    title: string;
    /** Use \n for the visual break shown by the renderer. */
    subtitle: string;
  };
  pillars: {
    icon: string;
    title: string;
    body: string;
  }[];
  certifications: {
    label: string;
    status: string;
    tone: 'live' | 'soon' | 'na';
  }[];
  subprocessors: {
    name: string;
    purpose: string;
    region: string;
  }[];
  cta: {
    title: string;
    subtitle: string;
    label: string;
    target: string;
  };
}

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalContent {
  slug: 'terms' | 'privacy' | 'dpa' | 'cookies';
  title: string;
  /** Free-text date so admins can write "May 21, 2026" if they prefer. */
  effective: string;
  intro: string;
  sections: LegalSection[];
}

// ── CMS media library ──────────────────────────────────────────────────

export interface MediaAsset {
  id: string;
  key: string;
  url: string;
  originalName: string;
  mime: string;
  sizeBytes: number;
  alt: string;
  width?: number | null;
  height?: number | null;
  focalX: number;
  focalY: number;
  folder: string;
  uploadedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetListResponse {
  data: MediaAsset[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
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

/**
 * Editorial state — mirrors backend MarketingPageStatus. Phase-4 work.
 */
export type MarketingPageStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface MarketingPage {
  id: string;
  slug: string;
  title: string;
  seo?: MarketingPageSEO | null;
  content?: Record<string, unknown> | null;
  bodyHtml?: string | null;
  /** New status field — source of truth on the backend. */
  status: MarketingPageStatus;
  /** ISO timestamp; non-null only when status = 'scheduled'. */
  scheduledFor?: string | null;
  /** Denormalised mirror of `status === 'published'`. Kept for the
   *  transition period — prefer reading `status` on new code. */
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Marketing-page revisions (Phase 5 history) ─────────────────────────

export interface MarketingPageRevisionSnapshot {
  title?: string;
  slug?: string;
  seo?: MarketingPageSEO | null;
  content?: Record<string, unknown> | null;
  bodyHtml?: string | null;
  status?: MarketingPageStatus;
  scheduledFor?: string | null;
  isPublished?: boolean;
  publishedAt?: string | null;
}

export interface MarketingPageRevision {
  id: string;
  pageId: string;
  snapshot: MarketingPageRevisionSnapshot;
  authorId?: string | null;
  authorName?: string | null;
  reason?: string | null;
  createdAt: string;
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

// ── Auth (login / register / /me) ──────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'district_admin'
  | 'school_admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian'
  | 'office_staff'
  // CMS roles (Phase 1 of the WordPress-style CMS roadmap). Tenant-less;
  // exist only to author public marketing content.
  | 'cms_admin'
  | 'cms_editor'
  | 'cms_author'
  | 'cms_contributor';

/** All four CMS roles — used by /cms route guards + UI gates. */
export const CMS_ROLES: ReadonlyArray<UserRole> = [
  'cms_admin',
  'cms_editor',
  'cms_author',
  'cms_contributor',
];

/** True if the role is any CMS role, including legacy super/district admin
 *  (who implicitly inherit CMS access for backwards compatibility). */
export function isCmsRole(role?: UserRole | string | null): boolean {
  if (!role) return false;
  if (role === 'super_admin' || role === 'district_admin') return true;
  return (CMS_ROLES as ReadonlyArray<string>).includes(role);
}

/** True if the role can publish (vs. just create drafts). */
export function canPublish(role?: UserRole | string | null): boolean {
  return (
    role === 'super_admin' ||
    role === 'district_admin' ||
    role === 'cms_admin' ||
    role === 'cms_editor' ||
    role === 'cms_author'
  );
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
  permissions?: string[];
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  schoolName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  planId: string;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface SchoolDetails {
  id: string;
  name: string;
  code?: string;
  status?: 'active' | 'inactive' | 'blocked';
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface SchoolStats {
  studentsCount?: number;
  teachersCount?: number;
  staffCount?: number;
  parentsCount?: number;
  classesCount?: number;
}

export interface SubscriptionPlanShape {
  id: string;
  name: string;
  description?: string;
  priceMonthly?: number;
  priceYearly?: number;
  currency?: string;
  maxStudents?: number;
  maxStaff?: number;
  isActive?: boolean;
  features?: string[];
}

export interface MySubscription {
  id?: string;
  status?: 'trialing' | 'active' | 'expired' | 'cancelled' | 'past_due';
  trialEndsAt?: string;
  endsAt?: string;
  startedAt?: string;
  plan?: SubscriptionPlanShape;
  planName?: string;
}
