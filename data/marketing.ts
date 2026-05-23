// Marketing-site content. Blog/docs have no CMS backend yet, so these act
// as the fallback the data layer returns when the API is absent/errors.

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  date: string;
  tag: string;
  readMins: number;
  cover: string;
  image?: string;
  metaData?: Record<string, any>;
}

export interface DocSection {
  slug: string;
  title: string;
  summary: string;
  items: { q: string; a: string }[];
}

export interface Feature {
  icon: string;
  title: string;
  desc: string;
}

export const FEATURES: Feature[] = [
  { icon: '🎓', title: 'Student & Academics', desc: 'Admissions, classes, sections, attendance, exams and report cards in one place.' },
  { icon: '💸', title: 'Fees & Billing', desc: 'Structures, invoices, online payments and automated dues reminders.' },
  { icon: '👨‍🏫', title: 'Staff & Payroll', desc: 'Teachers, HR, role-based access and payroll — fully tenant-isolated.' },
  { icon: '🔔', title: 'Realtime Notifications', desc: 'In-app + email alerts for exams, assignments, fees and plan renewals.' },
  { icon: '🛡️', title: 'RBAC & Multi-tenant', desc: 'Granular permissions; every school’s data is strictly isolated.' },
  { icon: '📊', title: 'Reports & Insights', desc: 'Live dashboards for admins, teachers, parents and students.' },
];

export const TESTIMONIALS = [
  { name: 'Anita Rao', role: 'Principal, Greenwood High', quote: 'We cut fee-collection time by 60% in the first term. The parents love the transparency.' },
  { name: 'Imran Sheikh', role: 'Director, BrightPath Group', quote: 'Rolling out across 7 campuses was painless — the tenant isolation just works.' },
  { name: 'Maria DSouza', role: 'Admin, Little Scholars', quote: 'Attendance, exams and notifications in one dashboard. Our staff onboarded in a day.' },
];

export const FAQS = [
  { q: 'Can I try it before paying?', a: 'Yes — every plan starts with a trial. No card required to explore the platform.' },
  { q: 'Is my school’s data isolated?', a: 'Absolutely. Every query is scoped by school; no tenant can ever see another’s data.' },
  { q: 'Do you support online fee payments?', a: 'Yes, via Razorpay. Invoices, dues reminders and payment history are built in.' },
  { q: 'What happens when my plan expires?', a: 'Staff access pauses (students/parents keep read access). Renew anytime from the billing page to restore full access instantly.' },
  { q: 'Can we migrate from our current system?', a: 'Our team helps with bulk import of students, staff and historical data. Talk to sales.' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'reduce-fee-defaults',
    title: '5 ways schools cut fee defaults with automation',
    excerpt: 'Late fees drain admin time. Here’s how automated invoicing and reminders flip the script.',
    body: 'Manual fee tracking is error-prone and slow. By generating invoices per fee structure, sending scheduled reminders, and offering one-click online payments, schools routinely see collection rates climb past 90%. The key is removing friction for parents while giving accountants a single dues dashboard...',
    author: 'EduSphere Team',
    date: '2026-05-02',
    tag: 'Finance',
    readMins: 5,
    cover: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
  },
  {
    slug: 'ultimate-guide-to-choosing-the-best-lms-for-schools-in-2026',
    title: 'Why role-based access matters for multi-campus groups',
    excerpt: 'A teacher should never see another school’s data. Here’s how proper RBAC prevents leaks.',
    body: 'Multi-tenant platforms live or die on isolation. Role-based access control, combined with per-request tenant scoping, ensures a school admin only ever touches their own school — while a group owner gets a roll-up view. We walk through the permission model and the guard chain that enforces it...',
    author: 'EduSphere Team',
    date: '2026-04-21',
    tag: 'Security',
    readMins: 7,
    cover: 'linear-gradient(135deg,#7c3aed,#ec4899)',
  },
  {
    slug: 'parent-engagement',
    title: 'Boosting parent engagement with realtime notifications',
    excerpt: 'Parents act faster when they’re informed. Notifications turn passive parents into partners.',
    body: 'When an exam is scheduled or an assignment posted, parents and students get an instant in-app and email nudge. Attendance dips trigger alerts. The result: fewer surprises at report-card time and measurably higher parent participation...',
    author: 'EduSphere Team',
    date: '2026-04-10',
    tag: 'Engagement',
    readMins: 4,
    cover: 'linear-gradient(135deg,#0ea5e9,#10b981)',
  },
];

export const DOCS: DocSection[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    summary: 'Spin up your school in minutes.',
    items: [
      { q: 'How do I register my school?', a: 'Click “Get started”, pick a plan, and create your school-admin account. You’ll land in the dashboard immediately.' },
      { q: 'How do I add teachers and students?', a: 'From the dashboard, open Permissions & Roles or Students/Teachers and use “Add user”. Bulk import is available on request.' },
    ],
  },
  {
    slug: 'billing',
    title: 'Billing & plans',
    summary: 'Subscriptions, renewals and payments.',
    items: [
      { q: 'How does renewal work?', a: 'Open Subscriptions → pick a plan → pay via Razorpay. Access is restored instantly and a receipt is recorded in payment history.' },
      { q: 'What if my plan expires?', a: 'School staff are paused; students and parents keep read access. Renew anytime to unlock full access.' },
    ],
  },
  {
    slug: 'roles',
    title: 'Roles & permissions',
    summary: 'Who can see and do what.',
    items: [
      { q: 'Can a school admin grant permissions?', a: 'Yes — the Permissions & Roles page lets a school admin assign roles and toggle granular permissions per staff member.' },
      { q: 'Is data isolated per school?', a: 'Every privileged query is scoped by the school in the JWT. No cross-tenant access is possible.' },
    ],
  },
];
