import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { buildPageMetadata } from '@/lib/seo';
import { hasAuthCookie } from '@/lib/auth-server';
import { LoginForm } from './LoginForm';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'login',
    title: 'Sign in',
    description: 'Sign in to your EduSphere school account.',
    path: '/login',
    noindex: true,
  });
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Already signed in — skip the form.
  if (await hasAuthCookie()) redirect('/me');

  const { next } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-72px)] grid md:grid-cols-2">
      {/* Left rail — value prop */}
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
            Welcome back.
          </h1>
          <p className="text-white/85 leading-relaxed max-w-[420px]">
            Sign in to manage your school — admissions, attendance, fees,
            exams and parent communication on one secure tenant.
          </p>
          <ul className="space-y-3 mt-8 text-[14px] text-white/90">
            <li>✓ Single sign-on for every staff role</li>
            <li>✓ Live attendance and fee dashboards</li>
            <li>✓ One-click report card publishing</li>
          </ul>
        </div>
        <div className="text-[13px] text-white/70">
          New here?{' '}
          <Link href="/register" className="text-white underline">
            Start your 14-day trial
          </Link>
          .
        </div>
      </aside>

      {/* Right rail — form */}
      <section className="flex items-center justify-center py-12 px-5">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="md:hidden block text-center font-extrabold text-lg mb-6">
            EduSphere
          </Link>
          <h2 className="text-[26px] font-extrabold text-slate-900">Sign in to your account</h2>
          <p className="text-slate-500 text-[14px] mt-1.5 mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium" style={{ color: 'var(--color-brand)' }}>
              Start free
            </Link>
          </p>

          <LoginForm nextPath={next} />

          <div className="mt-6 text-center">
            <a
              href={`${APP_URL}/forgot-password`}
              className="text-[13px] text-slate-500 hover:text-slate-700"
            >
              Forgot your password?
            </a>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 text-center text-[12px] text-slate-400">
            Protected by industry-standard encryption. Sessions expire automatically.
          </div>
        </div>
      </section>
    </div>
  );
}
