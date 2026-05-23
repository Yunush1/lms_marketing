import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { ContactForm } from './ContactForm';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    slug: 'contact',
    title: 'Contact',
    description:
      'Tell us about your school — EduSphere sales will reach out within one business day.',
    path: '/contact',
  });
}

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 -translate-y-px" style={{ color: 'var(--color-brand)' }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 -translate-y-px" style={{ color: 'var(--color-brand)' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 -translate-y-px" style={{ color: 'var(--color-brand)' }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function ContactPage() {
  return (
    <div className="py-16">
      <div className="max-w-[1000px] mx-auto px-5">
        <h1 className="text-center text-[clamp(28px,4vw,42px)] font-extrabold text-slate-900 m-0">
          Talk to our team
        </h1>
        <p className="text-center text-slate-500 text-[17px] mt-3 mb-10">
          Tell us about your school. Sales will reach out within one business day.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white rounded-[14px] p-6 border border-slate-100">
            <div className="flex flex-col gap-5">
              <div><MailIcon /> sales@edusphere.app</div>
              <div><PhoneIcon /> +91 80 1234 5678</div>
              <div><PinIcon /> Bengaluru, India</div>
              <div className="text-slate-500 text-[13px] leading-relaxed mt-2">
                Prefer a demo? Mention it in the message and we&apos;ll set up
                a walkthrough tailored to your school.
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white rounded-[14px] p-6 border border-slate-100">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
