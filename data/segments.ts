// Shared content for Solutions / Product / Integrations / Customers
// marketing pages. Keeping all the page copy in one module makes editing
// fast and prevents drift between segments.

export interface SegmentSection {
  title: string;
  body: string;
}

export interface SegmentPage {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  sections: SegmentSection[];
  capabilities?: { title: string; body: string; bullets: string[] }[];
  caseStudy?: { name: string; quote: string; role: string; metrics: { label: string; value: string }[] };
  cta: { primary: string; primaryTarget: string; secondary?: string; secondaryTarget?: string };
}

export const SOLUTIONS: Record<string, SegmentPage> = {
  schools: {
    slug: 'schools',
    eyebrow: 'Solutions · K-12 single school',
    title: 'Run a single school without the spreadsheet sprawl.',
    subtitle:
      'EduSphere unifies admissions, attendance, fees, exams and parent communication on one tenant. You can be running attendance in your first day.',
    bullets: [
      'Bulk admissions and enrollment',
      'Daily attendance for students and staff',
      'Exams, results and report cards',
      'Online fee collection via Razorpay',
      'Parent app + email notifications',
    ],
    sections: [
      {
        title: 'Replace 5+ tools with one',
        body:
          'Most single schools we onboard come off a mix of Google Sheets, an offline ERP, WhatsApp groups and a fee-printer. EduSphere consolidates these into a single tenant with one set of users, one billing relationship, and one place to look for the truth.',
      },
      {
        title: 'Roles that match how your school works',
        body:
          'School admin, teacher, accountant, librarian, office staff, student, parent — every role has a default landing page and the right permissions, and a school admin can override anything per user.',
      },
    ],
    capabilities: [
      {
        title: 'Academics',
        body: 'Classes, sections, subjects, attendance, exams, assignments — all linked to academic years.',
        bullets: ['Promotion workflows', 'Subject-teacher assignments', 'Report-card publishing'],
      },
      {
        title: 'Fees & finance',
        body: 'Build fee structures, generate invoices, accept payments online, and reconcile in one place.',
        bullets: ['Razorpay online payments', 'Automated dues reminders', 'Receipt history per student'],
      },
      {
        title: 'Communication',
        body: 'Notify parents and staff in-app and by email, with attendance and exam alerts built in.',
        bullets: ['In-app + email alerts', 'Targeted by role', 'Attendance dip alerts'],
      },
    ],
    caseStudy: {
      name: 'Greenwood High',
      role: 'Principal',
      quote:
        'We cut fee-collection time by 60% in the first term. The parents love the transparency.',
      metrics: [
        { label: 'Reduction in fee follow-ups', value: '60%' },
        { label: 'Faster onboarding vs old ERP', value: '5×' },
      ],
    },
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'Book a demo', secondaryTarget: '/contact?intent=demo' },
  },
  groups: {
    slug: 'groups',
    eyebrow: 'Solutions · Multi-campus groups',
    title: 'One platform across every campus. Zero data leaks between them.',
    subtitle:
      'EduSphere is multi-tenant from the database up. Each campus is its own tenant; the group office gets a rollup. Audit trails and RBAC keep the boundary clean.',
    bullets: [
      'Per-school tenant isolation',
      'Group-office rollup reports',
      'Central plan & billing',
      'Cross-campus academic standards',
      'SSO on Scale (SAML on Enterprise)',
    ],
    sections: [
      {
        title: 'Why isolation matters',
        body:
          'Every privileged query is scoped by the school in the user’s JWT. A teacher at Campus A cannot see Campus B — by design, not by feature flag. That guarantee survives every release because it is enforced at the data layer.',
      },
      {
        title: 'Rollups without compromise',
        body:
          'District- and group-level dashboards aggregate counts (enrollment, attendance %, fee dues) across campuses, while still leaving the underlying tenant boundaries intact.',
      },
    ],
    capabilities: [
      {
        title: 'Per-campus admin',
        body: 'Each campus has its own school_admin who manages staff, students, and operations on their tenant.',
        bullets: ['Local RBAC', 'Local notification policies', 'Local fee structures'],
      },
      {
        title: 'Group-office view',
        body: 'District admins see cross-campus rollups for planning, reporting and audits.',
        bullets: ['Cross-campus reports', 'Centralised audit trail', 'Standardised report-card templates'],
      },
      {
        title: 'Identity & access',
        body: 'Bring your own identity provider. Standardise roles across the group with consistent permission catalogues.',
        bullets: ['Google SSO (Scale)', 'SAML SSO (Enterprise)', 'Per-user permission overrides'],
      },
    ],
    caseStudy: {
      name: 'BrightPath Group',
      role: 'Director, 7-campus group',
      quote: 'Rolling out across 7 campuses was painless — the tenant isolation just works.',
      metrics: [
        { label: 'Campuses onboarded', value: '7' },
        { label: 'Rollout time per campus', value: '< 2 days' },
      ],
    },
    cta: { primary: 'Talk to sales', primaryTarget: '/contact?intent=enterprise', secondary: 'See pricing', secondaryTarget: '/pricing' },
  },
  coaching: {
    slug: 'coaching',
    eyebrow: 'Solutions · Coaching & tutoring',
    title: 'Run coaching like a school — without the school-sized overhead.',
    subtitle:
      'Coaching centres need the same things — enrollment, attendance, fees, parent comms — but at a tighter operational rhythm. EduSphere fits both.',
    bullets: [
      'Quick batch / cohort setup',
      'Per-batch attendance and fees',
      'WhatsApp-ready notifications (roadmap)',
      'Parent-facing payment portal',
      'Free tier for pilots',
    ],
    sections: [
      {
        title: 'Start small, scale calmly',
        body:
          'The Starter plan is free for up to 50 students — enough to pilot the platform with one batch before rolling out across centres.',
      },
      {
        title: 'Built around your fee model',
        body:
          'Per-batch fee structures, monthly invoicing, online collection via Razorpay, and one-tap receipts — without forcing you to redesign your tuition rules.',
      },
    ],
    capabilities: [
      {
        title: 'Batches & cohorts',
        body: 'Map every group as a class with subject assignments and a teacher.',
        bullets: ['Roll into academic years', 'Per-cohort timetables', 'Promotion / retention workflows'],
      },
      {
        title: 'Fees that match coaching',
        body: 'Per-batch structures, partial payments, refunds tracked end-to-end.',
        bullets: ['Online + offline payments', 'Per-student dues view', 'Receipts on demand'],
      },
      {
        title: 'Parent communication',
        body: 'Push attendance, exam and fee alerts straight to parents.',
        bullets: ['In-app + email today', 'WhatsApp on roadmap', 'Targeted by batch'],
      },
    ],
    caseStudy: {
      name: 'Crescent Coaching',
      role: 'Director',
      quote: 'Attendance, exams and notifications in one dashboard. Our staff onboarded in a day.',
      metrics: [
        { label: 'Staff onboarding', value: '< 1 day' },
        { label: 'Fee-collection lift', value: '+35%' },
      ],
    },
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'See pricing', secondaryTarget: '/pricing' },
  },
};

export const PRODUCTS: Record<string, SegmentPage> = {
  academics: {
    slug: 'academics',
    eyebrow: 'Product · Academics',
    title: 'Academics that run themselves.',
    subtitle:
      'Admissions, classes, attendance, exams and report cards — connected through your academic year so nothing falls between the cracks.',
    bullets: [
      'Bulk admissions & enrollment',
      'Sections, subjects and teacher assignments',
      'Daily and per-period attendance',
      'Exams, results and aggregated report cards',
      'Promotion & retention workflows',
    ],
    sections: [
      {
        title: 'Built around the academic year',
        body:
          'Every record — class, attendance, assignment, exam result — is scoped to an academic year. Roll over to next year and historical data stays right where it belongs.',
      },
      {
        title: 'From mark sheet to report card',
        body:
          'Capture exam results, blend with assignment outcomes, and publish report cards to parents in one click.',
      },
    ],
    capabilities: [
      {
        title: 'Attendance',
        body: 'Daily attendance for students and staff, with section roll-ups and parent visibility.',
        bullets: ['Mark in seconds', 'Section + subject views', 'Dip alerts to parents'],
      },
      {
        title: 'Exams & results',
        body: 'Structured exam entry with passing-marks logic and per-subject grading.',
        bullets: ['Per-subject grading', 'Aggregate report cards', 'Result history per student'],
      },
      {
        title: 'Assignments',
        body: 'Post assignments with due dates, accept submissions, grade with feedback.',
        bullets: ['Per-subject workflows', 'Status tracking', 'Parent visibility'],
      },
    ],
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'See all features', secondaryTarget: '/pricing' },
  },
  'fees-billing': {
    slug: 'fees-billing',
    eyebrow: 'Product · Fees & billing',
    title: 'Cut fee follow-ups by more than half.',
    subtitle:
      'Build fee structures once, auto-generate invoices, collect online via Razorpay, and reconcile in one place.',
    bullets: [
      'Fee structures linked to academic years',
      'Per-student invoices with due dates',
      'Online + offline payment recording',
      'Automated dues reminders',
      'Receipts and payment history',
    ],
    sections: [
      {
        title: 'Stop chasing parents',
        body:
          'Automated reminders, online payments, and a clean parent-facing dues view do most of the chasing for you. Accountants get a single dashboard of who owes what.',
      },
      {
        title: 'Auditable end-to-end',
        body:
          'Every invoice, payment and refund is captured with actor, time and metadata in the audit log. Reconciliation is a query, not a manual hunt.',
      },
    ],
    capabilities: [
      {
        title: 'Structures',
        body: 'Tuition, transport, lab — each fee head modelled as a structure with its own due day.',
        bullets: ['Per-grade or per-batch', 'Per-academic-year', 'Reusable across cohorts'],
      },
      {
        title: 'Invoices',
        body: 'Auto-generate per-student invoices from structures.',
        bullets: ['Status: pending/paid/overdue', 'Partial payments', 'Receipt PDF'],
      },
      {
        title: 'Payments',
        body: 'Accept online via Razorpay, record offline (cash/cheque/bank) in two taps.',
        bullets: ['Razorpay live', 'Bank/cheque/cash recording', 'Refund tracking'],
      },
    ],
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'See pricing', secondaryTarget: '/pricing' },
  },
  'staff-payroll': {
    slug: 'staff-payroll',
    eyebrow: 'Product · Staff & payroll',
    title: 'Your team, organised.',
    subtitle:
      'Teachers and staff with role-based permissions, attendance, and payroll runs — all under your school’s tenant.',
    bullets: [
      'Staff directory with documents',
      'Daily staff attendance',
      'Payroll runs per cycle',
      'Per-user permission overrides',
      'Audit logs for sensitive changes',
    ],
    sections: [
      {
        title: 'Permissions you can actually manage',
        body:
          'Each role has a sensible default catalogue. A school admin can revoke a single permission for a single user without touching code — useful for interns, part-time teachers, and substitutes.',
      },
      {
        title: 'Payroll close to the data',
        body:
          'Runs sit next to attendance, leave and HR records — so payroll calculation has all the inputs in one place.',
      },
    ],
    capabilities: [
      {
        title: 'Directory',
        body: 'Teachers, accountants, librarians, office staff — modelled as users with their own roles.',
        bullets: ['Per-role permissions', 'Document storage', 'Status: active / inactive'],
      },
      {
        title: 'Attendance',
        body: 'Staff attendance recorded per day with audit metadata.',
        bullets: ['Per-day status', 'Remarks per record', 'Reports per period'],
      },
      {
        title: 'Payroll',
        body: 'Per-cycle payroll runs with auditable salary line items.',
        bullets: ['Runs per cycle', 'Per-employee statements', 'Export-ready'],
      },
    ],
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'See pricing', secondaryTarget: '/pricing' },
  },
  parents: {
    slug: 'parents',
    eyebrow: 'Product · Parent engagement',
    title: 'Parents who actually know what’s happening.',
    subtitle:
      'Realtime in-app and email notifications for exams, assignments, attendance and fees. Less surprise at report-card time.',
    bullets: [
      'In-app + email alerts',
      'Per-parent dues view',
      'Attendance dip alerts',
      'Exam & assignment notifications',
      'Targeted communication by role',
    ],
    sections: [
      {
        title: 'A single, calm channel',
        body:
          'Replace ad-hoc WhatsApp groups with structured notifications. Parents see what concerns their child, when it concerns them.',
      },
      {
        title: 'Read-only when it should be',
        body:
          'Even if a school’s plan expires, parents and students keep read access so they can still pay dues and see records — and your school keeps running.',
      },
    ],
    capabilities: [
      {
        title: 'Notifications',
        body: 'Realtime in-app + email; WhatsApp on the roadmap.',
        bullets: ['In-app feed', 'Email alerts', 'Per-event targeting'],
      },
      {
        title: 'Dues & payments',
        body: 'Parents pay dues in a click via Razorpay and download receipts.',
        bullets: ['Live dues view', 'Online payment', 'Receipt download'],
      },
      {
        title: 'Academic visibility',
        body: 'Attendance, assignments, exam results — parents see them as they happen.',
        bullets: ['Attendance trend', 'Assignment status', 'Result history'],
      },
    ],
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'See pricing', secondaryTarget: '/pricing' },
  },
  reports: {
    slug: 'reports',
    eyebrow: 'Product · Reports & insights',
    title: 'Numbers your principal trusts.',
    subtitle:
      'Live dashboards for every role — admin, teacher, parent, student — with audit logs underneath every number.',
    bullets: [
      'Role-specific dashboards',
      'Drill from rollup to student',
      'Audit logs for every state change',
      'Exports on Scale and above',
      'Custom reports on Enterprise',
    ],
    sections: [
      {
        title: 'Truth, not vanity',
        body:
          'Every dashboard cell is backed by a query you can audit. No black-box "AI insights" — just the operational metrics that actually move a school.',
      },
      {
        title: 'Designed for who is looking',
        body:
          'Super admins see platform rollups, district admins see their schools, school admins see their school, teachers see their classes, parents see their child. Same data, different lenses.',
      },
    ],
    capabilities: [
      {
        title: 'Dashboards',
        body: 'Daily attendance %, dues outstanding, exam outcomes — at a glance.',
        bullets: ['Super / district / school / teacher / parent / student', 'Drill to source', 'Refreshed live'],
      },
      {
        title: 'Audit logs',
        body: 'Every privileged action logged with actor, IP, agent and metadata.',
        bullets: ['Up to unlimited retention', 'Filter by user / entity', 'Export on Enterprise'],
      },
      {
        title: 'Exports',
        body: 'Pull data out for finance, regulators, or your own data team.',
        bullets: ['CSV today', 'Scheduled exports (roadmap)', 'API & webhooks (roadmap)'],
      },
    ],
    cta: { primary: 'Start free', primaryTarget: '/register', secondary: 'See pricing', secondaryTarget: '/pricing' },
  },
};

export const INTEGRATIONS = [
  {
    name: 'Razorpay',
    status: 'Live',
    body: 'Accept online fee payments via UPI, cards, net-banking and wallets. We never store card data.',
    tag: 'Payments',
  },
  {
    name: 'AWS S3',
    status: 'Live',
    body: 'File and document storage for student records, payroll documents and admissions paperwork.',
    tag: 'Storage',
  },
  {
    name: 'SendGrid',
    status: 'Live',
    body: 'Transactional email for password resets, invoice receipts and plan-renewal notices.',
    tag: 'Email',
  },
  {
    name: 'CSV / Excel',
    status: 'Live',
    body: 'Bulk import students, staff and historical data; export reports and audit data on demand.',
    tag: 'Data',
  },
  {
    name: 'Google Workspace SSO',
    status: 'Roadmap · Q3 2026',
    body: 'Sign-in with your school’s Google identity. Available on Scale and Enterprise.',
    tag: 'Identity',
  },
  {
    name: 'WhatsApp Business',
    status: 'Roadmap · Q4 2026',
    body: 'Send fee dues, attendance dips and exam notifications directly to parents on WhatsApp.',
    tag: 'Communication',
  },
  {
    name: 'SAML SSO',
    status: 'Roadmap · Enterprise',
    body: 'Bring your own identity provider for enterprise-grade access management.',
    tag: 'Identity',
  },
  {
    name: 'Webhooks API',
    status: 'Roadmap · 2026',
    body: 'Hook EduSphere events into your own systems — finance, BI, parent portals.',
    tag: 'API',
  },
];

export const CUSTOMERS = [
  {
    name: 'Greenwood High',
    location: 'Bengaluru, India',
    size: '1,200 students · K-12',
    quote: 'We cut fee-collection time by 60% in the first term. The parents love the transparency.',
    metrics: [
      { label: 'Reduction in fee follow-ups', value: '60%' },
      { label: 'Onboarding time', value: '< 1 day' },
    ],
  },
  {
    name: 'BrightPath Group',
    location: 'Pune, India',
    size: '7 campuses · 8,500 students',
    quote: 'Rolling out across 7 campuses was painless — the tenant isolation just works.',
    metrics: [
      { label: 'Campuses onboarded', value: '7' },
      { label: 'Per-campus rollout time', value: '< 2 days' },
    ],
  },
  {
    name: 'Little Scholars',
    location: 'Hyderabad, India',
    size: '320 students · pre-school',
    quote: 'Attendance, exams and notifications in one dashboard. Our staff onboarded in a day.',
    metrics: [
      { label: 'Staff onboarding', value: '1 day' },
      { label: 'Parent NPS', value: '+22' },
    ],
  },
];

export const CHANGELOG: { date: string; kind: 'New' | 'Improved' | 'Fixed'; title: string; body: string }[] = [
  {
    date: '2026-05-15',
    kind: 'New',
    title: 'Per-student price calculator on the pricing page',
    body: 'Drag a slider to your size and we’ll show the right plan and an indicative monthly cost.',
  },
  {
    date: '2026-05-12',
    kind: 'New',
    title: 'Security & trust page',
    body: 'Multi-tenant isolation, RBAC, encryption, audit logs, subprocessors and our compliance roadmap — all on one page.',
  },
  {
    date: '2026-05-09',
    kind: 'Improved',
    title: 'Slimmer school registration flow',
    body: 'Plan choice is deferred — you can land in your dashboard on a 14-day Growth trial in under 60 seconds.',
  },
  {
    date: '2026-04-28',
    kind: 'New',
    title: 'Plans v2 with annual billing and feature comparison',
    body: 'Four tiers (Starter, Growth, Scale, Enterprise), annual toggle saving ~20%, and a full side-by-side comparison table.',
  },
  {
    date: '2026-04-18',
    kind: 'Improved',
    title: 'Audit trail retention extended on Scale',
    body: 'Scale customers now keep audit logs for a full year. Enterprise keeps them indefinitely.',
  },
  {
    date: '2026-04-05',
    kind: 'Fixed',
    title: 'Report-card publishing on academic-year rollover',
    body: 'Fixed a defect where post-rollover report cards could miss the previous year’s aggregate. No data loss; reissue is automatic.',
  },
];
