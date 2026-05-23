// Static plans catalog — source of truth for the public Pricing page.
// The marketing API (`/subscriptions/public/plans`) returns SubscriptionPlan
// rows from the backend; this file gives every public surface a guaranteed
// fallback so /pricing renders even if the API is down or empty, and adds
// the marketing metadata (tier, comparison features, popular flag, annual
// price) that the backend SubscriptionPlan shape does not carry yet.

// Inlined here so plans.ts is self-contained in the Next.js marketing app —
// the original lives in the SPA's `types/index.ts`. Kept in sync by copy.
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly?: number;
  currency?: string;
  isActive?: boolean;
  maxStudents?: number;
  maxStaff?: number;
  maxSchools?: number;
}

export type PlanTier = 'starter' | 'growth' | 'scale' | 'enterprise';

export interface PlanFeatureRow {
  group: string;
  feature: string;
  starter: boolean | string;
  growth: boolean | string;
  scale: boolean | string;
  enterprise: boolean | string;
}

export interface MarketingPlan {
  tier: PlanTier;
  name: string;
  tagline: string;
  monthlyPrice: number;          // INR per month
  annualPrice: number | null;    // INR per month if billed annually; null = same as monthly
  currency: 'INR';
  maxStudents: number;           // 0 = unlimited
  maxStaff: number;              // 0 = unlimited
  maxSchools: number;            // 0 = unlimited
  highlights: string[];
  isPopular: boolean;
  ctaLabel: string;
  ctaTarget: string;
  contactSales: boolean;
}

export const STATIC_PLANS: MarketingPlan[] = [
  {
    tier: 'starter',
    name: 'Starter',
    tagline: 'Pilot the platform with a small school or coaching centre.',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'INR',
    maxStudents: 50,
    maxStaff: 5,
    maxSchools: 1,
    highlights: [
      'Up to 50 students',
      'Academics, attendance, classes',
      'Basic reports',
      'Email support',
    ],
    isPopular: false,
    ctaLabel: 'Start free',
    ctaTarget: '/register',
    contactSales: false,
  },
  {
    tier: 'growth',
    name: 'Growth',
    tagline: 'For single schools running day-to-day operations end-to-end.',
    monthlyPrice: 3499,
    annualPrice: 2799,
    currency: 'INR',
    maxStudents: 500,
    maxStaff: 50,
    maxSchools: 1,
    highlights: [
      'Up to 500 students',
      'Fees & online payments',
      'Payroll & staff management',
      'Parent app + notifications',
      'Priority email support',
    ],
    isPopular: true,
    ctaLabel: 'Start 14-day trial',
    ctaTarget: '/register',
    contactSales: false,
  },
  {
    tier: 'scale',
    name: 'Scale',
    tagline: 'For multi-campus groups that need consolidated reporting.',
    monthlyPrice: 9999,
    annualPrice: 7999,
    currency: 'INR',
    maxStudents: 2500,
    maxStaff: 200,
    maxSchools: 3,
    highlights: [
      'Up to 2,500 students',
      'Multi-campus rollup',
      'Advanced reports & exports',
      'Single Sign-On (Google)',
      'Phone + email support',
    ],
    isPopular: false,
    ctaLabel: 'Start 14-day trial',
    ctaTarget: '/register',
    contactSales: false,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    tagline: 'For chains, districts, and large institutions.',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'INR',
    maxStudents: 0,
    maxStaff: 0,
    maxSchools: 0,
    highlights: [
      'Unlimited students & schools',
      'SAML SSO + custom roles',
      'Dedicated customer success',
      'Custom SLA & audit exports',
      'On-prem option',
    ],
    isPopular: false,
    ctaLabel: 'Talk to sales',
    ctaTarget: '/contact?intent=enterprise',
    contactSales: true,
  },
];

export const PLAN_FEATURE_MATRIX: PlanFeatureRow[] = [
  // Academics
  { group: 'Academics', feature: 'Admissions & enrollment', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Academics', feature: 'Classes, sections, subjects', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Academics', feature: 'Attendance (student + staff)', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Academics', feature: 'Exams, results, report cards', starter: 'Basic', growth: true, scale: true, enterprise: true },
  { group: 'Academics', feature: 'Assignments & submissions', starter: false, growth: true, scale: true, enterprise: true },
  { group: 'Academics', feature: 'Timetable builder', starter: false, growth: true, scale: true, enterprise: true },
  // Fees
  { group: 'Fees & Billing', feature: 'Fee structures & invoices', starter: false, growth: true, scale: true, enterprise: true },
  { group: 'Fees & Billing', feature: 'Online payments (Razorpay)', starter: false, growth: true, scale: true, enterprise: true },
  { group: 'Fees & Billing', feature: 'Automated dues reminders', starter: false, growth: true, scale: true, enterprise: true },
  { group: 'Fees & Billing', feature: 'Payment history & receipts', starter: false, growth: true, scale: true, enterprise: true },
  // Staff
  { group: 'Staff & Payroll', feature: 'Teachers & staff directory', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Staff & Payroll', feature: 'Payroll runs', starter: false, growth: true, scale: true, enterprise: true },
  { group: 'Staff & Payroll', feature: 'Per-user permission overrides', starter: false, growth: true, scale: true, enterprise: true },
  // Comms
  { group: 'Communication', feature: 'In-app notifications', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Communication', feature: 'Email notifications', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Communication', feature: 'Parent portal access', starter: false, growth: true, scale: true, enterprise: true },
  { group: 'Communication', feature: 'WhatsApp notifications', starter: false, growth: 'Add-on', scale: true, enterprise: true },
  // Security
  { group: 'Security', feature: 'Multi-tenant data isolation', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Security', feature: 'Role-based access control', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Security', feature: 'Audit logs', starter: '30 days', growth: '90 days', scale: '1 year', enterprise: 'Unlimited' },
  { group: 'Security', feature: 'Google SSO', starter: false, growth: false, scale: true, enterprise: true },
  { group: 'Security', feature: 'SAML SSO', starter: false, growth: false, scale: false, enterprise: true },
  { group: 'Security', feature: 'Custom data residency', starter: false, growth: false, scale: false, enterprise: true },
  // Support
  { group: 'Support', feature: 'Help center & docs', starter: true, growth: true, scale: true, enterprise: true },
  { group: 'Support', feature: 'Email support', starter: 'Standard', growth: 'Priority', scale: 'Priority', enterprise: 'Dedicated' },
  { group: 'Support', feature: 'Phone support', starter: false, growth: false, scale: true, enterprise: true },
  { group: 'Support', feature: 'Onboarding assistance', starter: 'Self-serve', growth: 'Guided', scale: 'Guided', enterprise: 'White glove' },
  { group: 'Support', feature: 'Bulk data migration', starter: false, growth: 'Add-on', scale: true, enterprise: true },
  { group: 'Support', feature: 'Custom SLA', starter: false, growth: false, scale: false, enterprise: true },
];

export const PLAN_FAQS = [
  { q: 'Can I try EduSphere before paying?', a: 'Yes. Every paid plan starts with a 14-day trial — no card required to explore. The Starter tier stays free forever for small schools.' },
  { q: 'How does annual billing work?', a: 'Pick "Annual" on the pricing toggle and you save about 20% versus the monthly rate. You are still billed once a year — switch back any time.' },
  { q: 'What happens when my plan expires?', a: 'Staff write-access pauses; students and parents keep read-only access so the school keeps running. Renew from the Subscriptions page and full access returns instantly.' },
  { q: 'Is my school’s data isolated from other schools?', a: 'Every privileged query is scoped by the school in your JWT. No tenant can ever see another tenant’s data — read the Security page for the architecture.' },
  { q: 'Can I switch plans later?', a: 'Yes. Upgrade or downgrade at any time from the Subscriptions page. Pro-rated credits apply on upgrades.' },
  { q: 'Do you offer discounts for non-profit or government schools?', a: 'Yes. Reach out via the Contact page with your registration details and we will share an institutional rate.' },
  { q: 'Which payment methods do you support?', a: 'All major Indian payment methods via Razorpay — UPI, cards, net-banking, wallets. Wire transfer and PO-based billing on Enterprise.' },
  { q: 'Can I migrate from my current school software?', a: 'Yes. Our team helps with bulk CSV/Excel import of students, staff and historical data. Included on Scale and Enterprise; optional add-on on Growth.' },
  { q: 'Where is my data hosted?', a: 'On AWS data centres. Enterprise customers can choose region (Mumbai or Singapore). Custom data residency is available on request.' },
  { q: 'Do you provide an API or webhooks?', a: 'Read-only API is on the public roadmap and shipping in 2026. Webhooks for notifications are available on Scale and Enterprise.' },
];

export const STUDENT_BANDS = [
  { value: 'lt50', label: 'Under 50 students', tier: 'starter' as PlanTier },
  { value: '50_500', label: '50 – 500 students', tier: 'growth' as PlanTier },
  { value: '500_2500', label: '500 – 2,500 students', tier: 'scale' as PlanTier },
  { value: 'gt2500', label: '2,500+ students', tier: 'enterprise' as PlanTier },
];

// The SPA's mergePlans / findApiPlanIdForTier / pickTrialPlanId helpers
// live in the original frontend/src/data/plans.ts but aren't needed here —
// the marketing site reads STATIC_PLANS straight off the seed (with
// optional CMS overrides via marketingApi.getPricing()).
