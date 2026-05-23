/**
 * Inline fallbacks used when the backend `/marketing/*` endpoints are
 * unreachable at build / revalidation time. Mirrors the backend seed so
 * the site renders the same content with or without an API.
 */
import type { HomeContent, MarketingPricing } from '@/lib/types';
import { TESTIMONIALS } from './marketing';
import { STATIC_PLANS, PLAN_FEATURE_MATRIX, PLAN_FAQS } from './plans';

export const HOME_FALLBACK: HomeContent = {
  hero: {
    eyebrow: 'Multi-tenant school management platform',
    title: 'The operating system\nfor modern schools.',
    subtitle:
      'Admissions, attendance, exams, fees and parent communication — one platform, fully isolated per school, live in a day.',
    primaryCta: { label: 'Start free', target: '/register' },
    secondaryCta: { label: 'Book a demo', target: '/contact?intent=demo' },
    bullets: ['No card required', '14-day trial on paid plans', 'Cancel anytime'],
  },
  trustLogos: [
    'Greenwood High',
    'BrightPath Group',
    'Little Scholars',
    'Sunrise Academy',
    'Horizon Public',
    'Crescent Coaching',
  ],
  layers: [
    {
      icon: 'apartment',
      title: 'Academics',
      body: 'Admissions, classes, attendance, timetable, exams and report cards.',
      points: ['Bulk admissions', 'Subject-wise teacher assignments', 'Auto-generated report cards'],
    },
    {
      icon: 'thunderbolt',
      title: 'Operations',
      body: 'Fees, payroll, library, transport and inventory in one tenant.',
      points: ['Razorpay online payments', 'Dues reminders', 'Payroll runs per cycle'],
    },
    {
      icon: 'safety',
      title: 'Communication',
      body: 'Realtime notifications and a portal for parents and students.',
      points: ['In-app + email alerts', 'Attendance dip alerts', 'Exam & assignment notifications'],
    },
  ],
  roleTabs: [
    {
      key: 'principal',
      label: 'Principal',
      headline: 'See the whole school in one screen.',
      body:
        'Live dashboards for admissions, attendance, fees, and exam outcomes. Drill from a number to a student in two clicks.',
      bullets: ['Daily attendance and dues snapshot', 'Class-wise exam analytics', 'Staff workload visibility'],
    },
    {
      key: 'group',
      label: 'Group owner',
      headline: 'Run multiple campuses without spreadsheets.',
      body:
        'Roll-up reports across campuses with strict tenant isolation per school. Give each campus its own admin, while you see the whole.',
      bullets: ['Cross-campus rollup reports', 'Per-school RBAC', 'Central plan & billing'],
    },
    {
      key: 'it',
      label: 'IT / operations',
      headline: 'Security and integrations you can defend.',
      body:
        'JWT auth with refresh tokens, role-based access control with per-user overrides, audit logs, encryption in transit and at rest.',
      bullets: ['SSO on Scale & Enterprise', 'Tenant-scoped queries by JWT', 'Full audit trail per action'],
    },
    {
      key: 'teacher',
      label: 'Teacher',
      headline: 'Less admin. More teaching.',
      body:
        'One-tap attendance, structured grade entry, assignment posting with parent visibility — across web and mobile.',
      bullets: ['Mark attendance in seconds', 'Grade with rubrics', 'Parent communication built in'],
    },
  ],
  tour: [
    { title: 'Onboard students', body: 'Bulk import or add one-by-one. Every record is tenant-isolated from day one.', gradient: 'linear-gradient(135deg,#4f46e5,#06b6d4)' },
    { title: 'Run attendance', body: 'Daily attendance for students and staff, with section roll-ups and parent visibility.', gradient: 'linear-gradient(135deg,#7c3aed,#ec4899)' },
    { title: 'Collect fees online', body: 'Generate invoices from fee structures. Parents pay via Razorpay; receipts auto-issued.', gradient: 'linear-gradient(135deg,#0ea5e9,#10b981)' },
    { title: 'Publish report cards', body: 'Aggregate exam results into report cards. Share with parents in one click.', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  ],
  outcomes: [
    { stat: '60%', label: 'less time on fee follow-ups', detail: 'Reported by Greenwood High after one term on automated invoicing + dues reminders.' },
    { stat: '40%', label: 'fewer no-shows on exam day', detail: 'In-app + email notifications cut last-minute confusion across pilot schools.' },
    { stat: '1 day', label: 'average onboarding time', detail: 'Most single-school admins go from sign-up to running attendance the same day.' },
  ],
  integrations: [
    { name: 'Razorpay', tag: 'Live' },
    { name: 'Google Workspace', tag: 'Roadmap' },
    { name: 'WhatsApp Business', tag: 'Roadmap' },
    { name: 'AWS S3', tag: 'Live' },
    { name: 'CSV / Excel', tag: 'Live' },
    { name: 'Webhooks API', tag: 'Roadmap' },
  ],
  testimonials: TESTIMONIALS,
  faqIds: [0, 1, 2, 3, 4],
};

export const PRICING_FALLBACK: MarketingPricing = {
  plans: STATIC_PLANS.map((p) => ({
    tier: p.tier,
    name: p.name,
    tagline: p.tagline,
    monthlyPrice: p.monthlyPrice,
    annualPrice: p.annualPrice,
    currency: p.currency,
    maxStudents: p.maxStudents,
    maxStaff: p.maxStaff,
    maxSchools: p.maxSchools,
    highlights: p.highlights,
    isPopular: p.isPopular,
    ctaLabel: p.ctaLabel,
    ctaTarget: p.ctaTarget,
    contactSales: p.contactSales,
  })),
  featureMatrix: PLAN_FEATURE_MATRIX,
  faqs: PLAN_FAQS,
};
