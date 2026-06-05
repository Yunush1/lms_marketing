import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { hasAuthCookie } from '@/lib/auth-server';
import type { SubscriptionPlanShape } from '@/lib/types';
import { STATIC_PLANS } from '@/data/plans';
import { RegisterWizard } from './RegisterWizard';

const BASE =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000/api/v1';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'register',
    title: 'Start your free trial',
    description: 'Create your EduSphere school in two short steps. Free for 14 days.',
    path: '/register',
    noindex: true,
  });
}

/**
 * Server-side fetch of the public plans catalogue so the wizard's plan
 * picker is fully populated on first paint. Falls back to STATIC_PLANS
 * (the bundled seed) when the API is unreachable so registration still
 * works in dev.
 */
async function loadPlans(): Promise<SubscriptionPlanShape[]> {
  try {
    const res = await fetch(`${BASE}/subscriptions/public/plans`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data as SubscriptionPlanShape[];
    }
  } catch {
    /* ignore — use seed below */
  }
  // Seed has the marketing metadata but no real planId. Without a real
  // planId the backend register call will fail, so we surface the seed
  // here only so the UI renders — the wizard itself disables submit until
  // we have at least one API-backed plan.
  return STATIC_PLANS.map((p) => ({
    id: '',
    name: p.name,
    description: p.tagline,
    priceMonthly: p.monthlyPrice,
    maxStudents: p.maxStudents,
    maxStaff: p.maxStaff,
    isActive: true,
  }));
}

export default async function RegisterPage() {
  if (await hasAuthCookie()) redirect('/me');

  const plans = await loadPlans();

  return (
    <div className="min-h-[calc(100vh-72px)] grid md:grid-cols-[440px_1fr]">
      {/* Left rail */}
      <aside
        className="hidden md:flex flex-col justify-between p-12 text-white"
        style={{
          background:
            'linear-gradient(135deg, var(--color-brand) 0%, #6366f1 60%, #06b6d4 130%)',
        }}
      >
        <div>
          <Link href="/" className="font-extrabold text-xl">EduSphere</Link>
          <h1 className="text-[34px] font-extrabold leading-tight mt-12 mb-4">
            Start your<br />
            14-day free trial
          </h1>
          <p className="text-white/85 leading-relaxed max-w-[380px]">
            No card required. Live in a day. Cancel any time.
          </p>

          <ol className="space-y-5 mt-10 text-[14px]">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold">1</span>
              <div>
                <div className="font-semibold">Your school</div>
                <div className="text-white/70 text-[13px] mt-0.5">Name, account email and password.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold">2</span>
              <div>
                <div className="font-semibold">Tell us about your school</div>
                <div className="text-white/70 text-[13px] mt-0.5">Size and your role — helps us pick a plan.</div>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold">3</span>
              <div>
                <div className="font-semibold">Pick a plan</div>
                <div className="text-white/70 text-[13px] mt-0.5">Suggested based on your size. Switch any time.</div>
              </div>
            </li>
          </ol>
        </div>
        <div className="text-[13px] text-white/70">
          Already have an account?{' '}
          <Link href="/login" className="text-white underline">
            Sign in
          </Link>
          .
        </div>
      </aside>

      {/* Right rail */}
      <section className="py-12 px-5 md:px-12 max-w-[900px]">
        <div className="md:hidden mb-6 text-center">
          <Link href="/" className="font-extrabold text-lg">EduSphere</Link>
        </div>
        <RegisterWizard plans={plans} />
      </section>
    </div>
  );
}
