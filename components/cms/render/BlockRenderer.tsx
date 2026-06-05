import React from 'react';
import Link from 'next/link';
import type {
  Block,
  CtaBlock,
  FaqBlock,
  HeroBlock,
  ImageBlock,
  RichTextBlock,
  StatsBlock,
} from '@/lib/blocks';
import { FormRender } from './FormRender';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.edusphere.app';

/**
 * Public renderer for the block schema. One component per block type,
 * each kept self-contained so adding a new block type is just adding
 * an interface + a renderer here without touching the rest.
 */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b) => {
        switch (b.type) {
          case 'hero':
            return <HeroRender key={b.id} block={b} />;
          case 'richText':
            return <RichTextRender key={b.id} block={b} />;
          case 'stats':
            return <StatsRender key={b.id} block={b} />;
          case 'faq':
            return <FaqRender key={b.id} block={b} />;
          case 'cta':
            return <CtaRender key={b.id} block={b} />;
          case 'image':
            return <ImageRender key={b.id} block={b} />;
          case 'form':
            return <FormRender key={b.id} block={b} />;
        }
      })}
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────

const IN_SITE = new Set(['/register', '/login', '/contact', '/about', '/pricing']);

/** Decide whether a CTA target is a marketing-site route or a deep-link
 *  into the SPA — same rule the rest of the site uses. */
function ctaHref(target: string): string {
  return IN_SITE.has(target) || target.startsWith('/contact') || target.startsWith('/legal') || target.startsWith('/p/')
    ? target
    : `${APP_URL}${target}`;
}

function CtaButton({ label, target, kind }: { label: string; target: string; kind: 'primary' | 'secondary' | 'ghost' }) {
  const className = (() => {
    if (kind === 'primary') return 'px-5 py-2.5 rounded-[10px] text-white font-medium inline-block';
    if (kind === 'ghost') return 'px-5 py-2.5 rounded-[10px] border border-white/70 text-white font-medium inline-block';
    return 'px-5 py-2.5 rounded-[10px] border border-slate-300 text-slate-900 font-medium inline-block';
  })();
  const style = kind === 'primary' ? { background: 'var(--color-brand)' } : undefined;
  const href = ctaHref(target);
  return IN_SITE.has(target) || target.startsWith('/contact') || target.startsWith('/legal') || target.startsWith('/p/') ? (
    <Link href={href} className={className} style={style}>
      {label}
    </Link>
  ) : (
    <a href={href} className={className} style={style}>
      {label}
    </a>
  );
}

// ─── Per-block renderers ───────────────────────────────────────────────

function HeroRender({ block }: { block: HeroBlock }) {
  const [titleA, titleB] = block.title.split('\n');
  const bg = (() => {
    if (block.background === 'dark') return 'bg-slate-900 text-white';
    if (block.background === 'plain') return 'bg-white';
    return ''; // gradient applied inline below
  })();
  const inlineBg =
    block.background === 'gradient'
      ? { background: 'radial-gradient(1200px 500px at 50% -10%, var(--color-brand-50) 0%, #fff 60%)' }
      : undefined;
  const titleColor = block.background === 'dark' ? 'text-white' : 'text-slate-900';
  const subColor = block.background === 'dark' ? 'text-white/80' : 'text-slate-600';
  const hasImage = !!block.image?.url;

  // Single-column layout (centred) when there's no image; two-column
  // split with copy on the left when an image is supplied.
  return (
    <section className={`py-20 md:py-24 ${bg}`} style={inlineBg}>
      <div
        className={`max-w-[1200px] mx-auto px-5 ${
          hasImage ? 'grid md:grid-cols-2 gap-12 items-center' : 'text-center'
        }`}
      >
        <div className={hasImage ? 'text-left' : ''}>
          {block.eyebrow && (
            <span className="inline-block px-3.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-600)] text-[13px] font-medium mb-5">
              {block.eyebrow}
            </span>
          )}
          <h1 className={`text-[clamp(34px,5vw,58px)] leading-[1.08] m-0 font-extrabold ${titleColor}`}>
            {titleA}
            {titleB ? (
              <>
                <br />
                {titleB}
              </>
            ) : null}
          </h1>
          {block.subtitle && (
            <p
              className={`text-lg ${hasImage ? '' : 'max-w-[700px] mx-auto'} mt-5 mb-8 leading-relaxed ${subColor}`}
            >
              {block.subtitle}
            </p>
          )}
          {(block.primaryCta || block.secondaryCta) && (
            <div className={`flex gap-3 flex-wrap ${hasImage ? '' : 'justify-center'}`}>
              {block.primaryCta?.label && (
                <CtaButton
                  label={block.primaryCta.label}
                  target={block.primaryCta.target}
                  kind={block.background === 'dark' ? 'ghost' : 'primary'}
                />
              )}
              {block.secondaryCta?.label && (
                <CtaButton
                  label={block.secondaryCta.label}
                  target={block.secondaryCta.target}
                  kind={block.background === 'dark' ? 'ghost' : 'secondary'}
                />
              )}
            </div>
          )}
          {(block.bullets ?? []).length > 0 && (
            <div className={`mt-4 text-[13px] ${block.background === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
              {block.bullets!.map((b, i) => (
                <span key={b}>
                  {i > 0 && <>&nbsp;·&nbsp;</>}
                  <span style={{ color: '#10b981' }}>✓</span> {b}
                </span>
              ))}
            </div>
          )}
        </div>
        {hasImage && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.image!.url}
              alt={block.image!.alt}
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${(block.image!.focalX ?? 0.5) * 100}% ${(block.image!.focalY ?? 0.5) * 100}%`,
                aspectRatio: '4 / 3',
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ImageRender({ block }: { block: ImageBlock }) {
  if (!block.image?.url) return null;
  const maxW = block.width === 'narrow' ? 'max-w-[820px]' : block.width === 'full' ? 'max-w-none' : 'max-w-[1100px]';
  return (
    <section className="py-10">
      <figure className={`${maxW} mx-auto px-5`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.image.url}
          alt={block.image.alt}
          className="w-full h-auto rounded-2xl"
          style={{
            objectPosition: `${(block.image.focalX ?? 0.5) * 100}% ${(block.image.focalY ?? 0.5) * 100}%`,
          }}
        />
        {block.caption && (
          <figcaption className="text-center text-slate-500 text-sm mt-3">{block.caption}</figcaption>
        )}
      </figure>
    </section>
  );
}

function RichTextRender({ block }: { block: RichTextBlock }) {
  const maxW = block.width === 'wide' ? 'max-w-[1100px]' : 'max-w-[820px]';
  return (
    <section className="py-10">
      <div className={`${maxW} mx-auto px-5 prose prose-slate`}>
        {/*
          We trust admins on rich-text HTML — Phase 6 will swap in a
          sanitiser + Tiptap. For now, marked dangerouslySetInnerHTML
          consciously: the field is only writable by CMS roles.
        */}
        <div dangerouslySetInnerHTML={{ __html: block.html }} />
      </div>
    </section>
  );
}

function StatsRender({ block }: { block: StatsBlock }) {
  const dark = block.variant === 'dark';
  return (
    <section className={`py-10 ${dark ? 'bg-slate-900 text-slate-200' : ''}`}>
      <div className="max-w-[1200px] mx-auto px-5">
        {block.heading && (
          <h2 className={`text-center text-[26px] font-extrabold mb-7 ${dark ? 'text-white' : 'text-slate-900'}`}>
            {block.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {block.items.map((s, i) => (
            <div key={i}>
              <div className={`text-[44px] font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {s.stat}
              </div>
              <div className={`text-base mt-1 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
                {s.label}
              </div>
              {s.detail && (
                <div className={`text-xs mt-1.5 leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {s.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRender({ block }: { block: FaqBlock }) {
  return (
    <section className="py-10">
      <div className="max-w-[820px] mx-auto px-5">
        {block.heading && (
          <h2 className="text-center text-[26px] font-extrabold text-slate-900 mb-5">{block.heading}</h2>
        )}
        <div className="space-y-3">
          {block.items.map((f, i) => (
            <details key={i} className="bg-white border border-slate-200 rounded-[10px] p-4 group">
              <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                {f.q}
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="text-slate-600 leading-relaxed mt-3 mb-0">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaRender({ block }: { block: CtaBlock }) {
  const dark = block.variant === 'dark';
  const bg = dark ? '#0f172a' : 'var(--color-brand)';
  return (
    <section className="py-14">
      <div
        className="max-w-[1200px] mx-auto px-8 py-12 rounded-[20px] text-center text-white"
        style={{ background: bg }}
      >
        <h2 className="text-3xl font-extrabold m-0">{block.title}</h2>
        {block.subtitle && <p className="opacity-90 mt-3 mb-6">{block.subtitle}</p>}
        <div className="flex gap-3 justify-center flex-wrap mt-2">
          {block.primary?.label && (
            <CtaButton label={block.primary.label} target={block.primary.target} kind="ghost" />
          )}
          {block.secondary?.label && (
            <CtaButton label={block.secondary.label} target={block.secondary.target} kind="ghost" />
          )}
        </div>
      </div>
    </section>
  );
}
