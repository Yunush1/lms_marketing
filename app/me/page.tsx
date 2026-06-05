import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import {
  getCurrentUser,
  getMySchool,
  getMySchoolStats,
  getMySubscription,
} from '@/lib/auth-server';
import { LogoutButton } from './LogoutButton';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'me',
    title: 'My account',
    description: 'Your EduSphere account, school details and subscription.',
    path: '/me',
    noindex: true,
  });
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Platform admin',
  district_admin: 'District admin',
  school_admin: 'School admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
  accountant: 'Accountant',
  librarian: 'Librarian',
  office_staff: 'Office staff',
};

const STATUS_BADGE: Record<string, { label: string; tone: string }> = {
  trialing: { label: 'In trial', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  active: { label: 'Active', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  expired: { label: 'Expired', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  past_due: { label: 'Past due', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', tone: 'bg-slate-100 text-slate-600 border-slate-300' },
};

function fmtDate(s?: string | null) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(s?: string | null) {
  if (!s) return null;
  const d = new Date(s).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((d - now) / (1000 * 60 * 60 * 24)));
}

export default async function MePage() {
  const user = await getCurrentUser();
  // Cookie present but invalid (e.g. expired) → bounce to /login keeping
  // intent so we can come back here after sign-in.
  if (!user) redirect('/login?next=/me');

  // These can fail individually (e.g. user has no schoolId yet); the page
  // still renders the user card.
  const [school, stats, subscription] = await Promise.all([
    getMySchool(user.schoolId),
    getMySchoolStats(user.schoolId),
    getMySubscription(),
  ]);

  const status = subscription?.status ?? 'trialing';
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.active;
  const trialDaysLeft = daysUntil(subscription?.trialEndsAt);
  const planName =
    subscription?.plan?.name || subscription?.planName || 'Free trial';

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-72px)]">
      <div className="max-w-[1100px] mx-auto px-5 py-12">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-8">
          <div>
            <div className="text-[13px] uppercase tracking-wide text-slate-500 font-semibold">
              Account
            </div>
            <h1 className="text-[28px] font-extrabold text-slate-900 mt-1">
              Welcome back, {user.firstName}
            </h1>
            <p className="text-slate-500 mt-1 text-[14px]">
              Manage your account and jump back into your school dashboard.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={`${APP_URL}/dashboard`}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ background: 'var(--color-brand)' }}
            >
              Open dashboard →
            </a>
            <LogoutButton />
          </div>
        </div>

        {/* Trial banner */}
        {status === 'trialing' && (
          <div className="mb-6 px-5 py-4 rounded-[12px] bg-white border border-amber-200 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-[14px]">
              <span className="font-semibold text-amber-700">Trial in progress.</span>{' '}
              <span className="text-slate-700">
                {trialDaysLeft != null
                  ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left on your ${planName} trial.`
                  : `You're currently on the ${planName} trial.`}
              </span>
            </div>
            <a
              href={`${APP_URL}/subscriptions`}
              className="px-3 py-1.5 rounded-md border border-amber-300 text-amber-800 text-[13px] font-medium hover:bg-amber-50"
            >
              Pick a plan early
            </a>
          </div>
        )}

        {/* Three cards: user / school / plan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* User card */}
          <section className="bg-white rounded-[14px] border border-slate-200 p-6">
            <div className="text-[12px] uppercase tracking-wide text-slate-400 font-semibold">
              You
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-extrabold"
                style={{ background: 'var(--color-brand)' }}
                aria-hidden
              >
                {user.firstName?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div>
                <div className="font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-[13px] text-slate-500">
                  {ROLE_LABEL[user.role] ?? user.role}
                </div>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-[13px]">
              <Row label="Email" value={user.email} />
              <Row
                label="Permissions"
                value={
                  user.permissions?.length
                    ? `${user.permissions.length} granted`
                    : 'Role defaults'
                }
              />
              <Row label="Member since" value={fmtDate(user.createdAt)} />
            </dl>
            <a
              href={`${APP_URL}/settings`}
              className="block mt-5 text-[13px] font-medium"
              style={{ color: 'var(--color-brand)' }}
            >
              Edit profile →
            </a>
          </section>

          {/* School card */}
          <section className="bg-white rounded-[14px] border border-slate-200 p-6">
            <div className="text-[12px] uppercase tracking-wide text-slate-400 font-semibold">
              School
            </div>
            <div className="font-bold text-[18px] text-slate-900 mt-3">
              {school?.name ?? 'No school linked yet'}
            </div>
            {school?.code && (
              <div className="text-[12px] text-slate-500 mt-0.5">Code: {school.code}</div>
            )}
            <dl className="mt-5 space-y-2 text-[13px]">
              <Row label="Status" value={school?.status ?? '—'} mono />
              <Row label="Email" value={school?.email ?? '—'} />
              <Row label="Phone" value={school?.phone ?? '—'} />
              <Row label="Created" value={fmtDate(school?.createdAt)} />
            </dl>
            {school?.id && (
              <a
                href={`${APP_URL}/schools/${school.id}`}
                className="block mt-5 text-[13px] font-medium"
                style={{ color: 'var(--color-brand)' }}
              >
                Manage school →
              </a>
            )}
          </section>

          {/* Plan card */}
          <section className="bg-white rounded-[14px] border border-slate-200 p-6">
            <div className="text-[12px] uppercase tracking-wide text-slate-400 font-semibold">
              Subscription
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="font-bold text-[18px] text-slate-900">{planName}</div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.tone}`}
              >
                {badge.label}
              </span>
            </div>
            <dl className="mt-5 space-y-2 text-[13px]">
              <Row
                label="Price"
                value={
                  subscription?.plan?.priceMonthly != null
                    ? `₹${subscription.plan.priceMonthly.toLocaleString('en-IN')}/mo`
                    : '—'
                }
              />
              <Row label="Trial ends" value={fmtDate(subscription?.trialEndsAt)} />
              <Row label="Renews" value={fmtDate(subscription?.endsAt)} />
            </dl>
            <a
              href={`${APP_URL}/subscriptions`}
              className="block mt-5 text-[13px] font-medium"
              style={{ color: 'var(--color-brand)' }}
            >
              Manage subscription →
            </a>
          </section>
        </div>

        {/* Usage row */}
        {(stats?.studentsCount != null ||
          stats?.teachersCount != null ||
          stats?.staffCount != null ||
          stats?.classesCount != null) && (
          <section className="mt-6 bg-white rounded-[14px] border border-slate-200 p-6">
            <div className="text-[12px] uppercase tracking-wide text-slate-400 font-semibold mb-4">
              Usage
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Stat label="Students" value={stats?.studentsCount} max={subscription?.plan?.maxStudents} />
              <Stat label="Teachers" value={stats?.teachersCount} />
              <Stat label="Staff" value={stats?.staffCount} max={subscription?.plan?.maxStaff} />
              <Stat label="Classes" value={stats?.classesCount} />
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="mt-6 bg-white rounded-[14px] border border-slate-200 p-6">
          <div className="text-[12px] uppercase tracking-wide text-slate-400 font-semibold mb-4">
            Jump to
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLink href={`${APP_URL}/dashboard`} label="Dashboard" hint="Live overview" />
            <QuickLink href={`${APP_URL}/students`} label="Students" hint="Roster + admissions" />
            <QuickLink href={`${APP_URL}/fees`} label="Fees" hint="Invoices + dues" />
            <QuickLink href={`${APP_URL}/settings`} label="Settings" hint="School + branding" />
          </div>
        </section>

        <p className="text-center text-[12px] text-slate-400 mt-8">
          Need help? Email{' '}
          <Link href="/contact" className="underline">our team</Link>{' '}
          or read the{' '}
          <Link href="/docs" className="underline">docs</Link>.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-slate-900 text-right ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  max,
}: {
  label: string;
  value?: number;
  max?: number;
}) {
  const v = value ?? 0;
  const cap = max && max > 0 ? max : null;
  const pct = cap ? Math.min(100, Math.round((v / cap) * 100)) : null;
  return (
    <div>
      <div className="text-[12px] text-slate-500">{label}</div>
      <div className="font-extrabold text-[24px] text-slate-900 mt-0.5">
        {v.toLocaleString('en-IN')}
        {cap ? (
          <span className="text-slate-400 text-[13px] font-medium ml-1">
            / {cap.toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>
      {pct != null && (
        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: pct > 85 ? '#f59e0b' : 'var(--color-brand)',
            }}
          />
        </div>
      )}
    </div>
  );
}

function QuickLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <a
      href={href}
      className="block rounded-[10px] border border-slate-200 p-3 hover:border-slate-300 hover:shadow-sm transition"
    >
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="text-[12px] text-slate-500 mt-0.5">{hint}</div>
    </a>
  );
}
