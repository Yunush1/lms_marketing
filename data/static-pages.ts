/**
 * Bundled fallbacks for the once-static pages: About, Contact, Security, Legal.
 *
 * Each page reads the matching CMS row via `marketingApi.getPage(slug)` and
 * merges any admin override over these defaults. So when the CMS row is
 * missing — or the admin has only overridden a subset of fields — the page
 * still renders complete content from this file.
 */
import { LEGAL_DOCS } from './legal';
import type {
  AboutContent,
  ContactContent,
  LegalContent,
  SecurityContent,
} from '@/lib/types';

export const ABOUT_FALLBACK: AboutContent = {
  hero: {
    title: 'We build software schools actually enjoy using',
    intro:
      'EduSphere started with a simple belief: school administrators spend far too much time fighting spreadsheets and disconnected tools. We set out to build one secure, multi-tenant platform that unifies academics, fees, staff and parent communication — without sacrificing the strict data isolation every institution deserves.',
    body:
      'Today, schools and multi-campus groups run their day-to-day operations on EduSphere — from admissions to report cards to online fee collection — backed by role-based access control and realtime notifications.',
  },
  stats: [
    { label: 'Schools onboarded', value: '120+' },
    { label: 'Students managed', value: '85,000+' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Avg. onboarding', value: '1 day' },
  ],
  beliefsHeading: 'What we believe',
  beliefs: [
    { strong: 'Tenant isolation is non-negotiable.', rest: 'Every privileged query is scoped by the school in your JWT.' },
    { strong: 'Software should fade into the background.', rest: 'Two taps to mark attendance. One screen to reconcile fees.' },
    { strong: 'Schools deserve real support.', rest: 'Real humans, not ticket queues that go nowhere.' },
  ],
  ctas: [
    { label: 'Start free', target: '/register', primary: true },
    { label: 'Talk to our team', target: '/contact' },
  ],
};

export const CONTACT_FALLBACK: ContactContent = {
  hero: {
    title: 'Talk to our team',
    subtitle: 'Tell us about your school. Sales will reach out within one business day.',
  },
  channels: {
    email: 'sales@edusphere.app',
    phone: '+91 80 1234 5678',
    address: 'Bengaluru, India',
    hint:
      "Prefer a demo? Mention it in the message and we'll set up a walkthrough tailored to your school.",
  },
};

export const SECURITY_FALLBACK: SecurityContent = {
  hero: {
    eyebrow: 'Security',
    title: "Schools trust us with their most sensitive data.\nHere's how we earn it.",
    subtitle:
      'EduSphere is built multi-tenant from the database layer up. Tenant isolation, role-based access control, encryption, and audit logging are not features we added — they are how the platform works.',
  },
  pillars: [
    {
      icon: '🛡️',
      title: 'Multi-tenant data isolation',
      body: 'Every privileged backend query is scoped by the schoolId in your JWT. No code path lets one tenant read another tenant’s rows — not even by guessing IDs. Frontend-supplied IDs are never trusted; the server re-derives the school context from the signed token on every request.',
    },
    {
      icon: '🔑',
      title: 'Role-based access + permission overrides',
      body: 'Nine built-in roles (super, district, school admin, teacher, accountant, librarian, office staff, student, parent) plus per-user permission overrides. A school admin can revoke any granular permission for any staff member without writing code.',
    },
    {
      icon: '🔒',
      title: 'Encryption in transit and at rest',
      body: 'TLS 1.2+ on every connection. Database volumes encrypted with AES-256 at rest. Refresh tokens hashed before storage. We never store payment card data — Razorpay handles PCI scope end-to-end.',
    },
    {
      icon: '☁️',
      title: 'Backups, redundancy & uptime',
      body: 'Hourly point-in-time backups with 30-day retention. Multi-AZ Postgres replication. Target 99.9% monthly uptime; status page reports incidents in real time.',
    },
    {
      icon: '📜',
      title: 'Audit logs for every state change',
      body: 'Logins, password resets, fee receipts, exam grading, permission changes — every privileged action is logged with actor, IP, user agent and metadata. School admins can review their own school’s audit trail; super admins can review platform events.',
    },
    {
      icon: '👥',
      title: 'Strong authentication',
      body: 'Short-lived access tokens with rotated refresh tokens. Forgot-password flows use single-use, time-boxed reset tokens. Google SSO available on Scale; SAML SSO on Enterprise. MFA on the roadmap for 2026.',
    },
  ],
  certifications: [
    { label: 'SOC 2 Type 1', status: 'Roadmap · Q4 2026', tone: 'soon' },
    { label: 'GDPR-aligned data handling', status: 'Live', tone: 'live' },
    { label: 'India DPDP Act readiness', status: 'Live', tone: 'live' },
    { label: 'PCI scope', status: 'Out of scope (Razorpay handles cards)', tone: 'na' },
  ],
  subprocessors: [
    { name: 'Amazon Web Services', purpose: 'Hosting, storage, backups', region: 'ap-south-1 (Mumbai)' },
    { name: 'Razorpay', purpose: 'Online payments', region: 'India' },
    { name: 'SendGrid', purpose: 'Transactional email', region: 'Global' },
    { name: 'Cloudflare', purpose: 'DDoS, CDN, WAF', region: 'Global' },
  ],
  cta: {
    title: 'Need a security review or vendor questionnaire?',
    subtitle:
      "We're happy to walk your IT and procurement teams through our architecture.",
    label: 'Request a security review',
    target: '/contact?intent=security',
  },
};

/** Legal fallback per slug — reuses the existing LEGAL_DOCS map. */
export function legalFallback(slug: string): LegalContent | null {
  const doc = LEGAL_DOCS[slug];
  if (!doc) return null;
  return doc;
}
