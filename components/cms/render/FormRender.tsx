'use client';

import { useState } from 'react';
import type { FormBlock, FormField } from '@/lib/blocks';
import {
  TurnstileWidget,
  isTurnstileEnabled,
} from '@/components/security/TurnstileWidget';

/**
 * Public renderer for FormBlock. Client component because it needs to
 * own the submit state. Submits via `/api/leads` (the marketing site's
 * existing lead proxy) by default, or to a custom URL if the editor
 * supplied one.
 *
 * Fields with a standard mapping (name / email / phone / organization /
 * message) populate the matching lead column directly. Anything mapped
 * to `custom` is appended to the message body as
 * `Label: value` lines so admins still see what visitors entered.
 */
export function FormRender({ block }: { block: FormBlock }) {
  const [values, setValues] = useState<Record<string, string>>(() => initial(block.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Disabled in dev when no site key is configured. The backend mirrors
  // this so verification is skipped end-to-end.
  const captchaRequired = isTurnstileEnabled();

  const setField = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((s) => ({ ...s, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopError(null);

    // Client-side required-field check. Server still validates but a
    // failing early here cuts a roundtrip + keeps the UX snappy.
    const next: Record<string, string> = {};
    for (const f of block.fields) {
      if (f.required && !values[f.name]?.trim()) {
        next[f.name] = `${f.label} is required`;
      }
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // Gate the submit on a fresh captcha token whenever Turnstile is
    // configured. The backend enforces the same rule, so we'd hit a 401
    // anyway — better to surface the error inline before the roundtrip.
    if (captchaRequired && !captchaToken) {
      setTopError('Please complete the captcha challenge before submitting.');
      return;
    }

    // Build the lead payload from mapped fields; anything unmapped goes
    // into the message body so it's not silently lost.
    const payload: Record<string, string | undefined> = {
      source: block.source ?? 'page-form',
      captchaToken: captchaToken ?? undefined,
    };
    const extras: string[] = [];
    for (const f of block.fields) {
      const v = values[f.name]?.toString().trim();
      if (!v) continue;
      if (f.mapping === 'custom') {
        extras.push(`${f.label}: ${v}`);
      } else {
        payload[f.mapping] = v;
      }
    }
    if (extras.length) {
      payload.message = [payload.message ?? '', ...extras].filter(Boolean).join('\n');
    }
    if (!payload.name) payload.name = '(no name provided)';
    if (!payload.email) payload.email = 'noreply@edusphere.app';

    setSubmitting(true);
    try {
      const url = block.endpoint?.trim() || '/api/leads';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? `Submit failed (${res.status})`);
      }
      setDone(true);
    } catch (err) {
      setTopError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="py-12">
        <div className="max-w-[640px] mx-auto px-5 bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="text-emerald-700 font-bold text-lg">All set</div>
          <p className="text-emerald-800 mt-2 leading-relaxed">{block.successMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-[720px] mx-auto px-5">
        {(block.heading || block.subheading) && (
          <div className="text-center mb-6">
            {block.heading && (
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 m-0">
                {block.heading}
              </h2>
            )}
            {block.subheading && (
              <p className="text-slate-500 mt-2">{block.subheading}</p>
            )}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8"
          noValidate
        >
          {topError && (
            <div className="mb-4 px-4 py-3 bg-red-50 text-red-800 rounded-lg text-sm">
              {topError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {block.fields.map((f) => (
              <div
                key={f.id}
                className={f.half ? '' : 'md:col-span-2'}
              >
                <FieldInput
                  field={f}
                  value={values[f.name] ?? ''}
                  error={errors[f.name]}
                  onChange={(v) => setField(f.name, v)}
                />
              </div>
            ))}
          </div>
          {/* Turnstile widget — renders inline when configured, no-op
              otherwise. Token is captured into state and shipped with
              the submit payload. */}
          <TurnstileWidget action="lead-submit" onToken={setCaptchaToken} />
          <button
            type="submit"
            disabled={submitting || (captchaRequired && !captchaToken)}
            className="mt-6 w-full md:w-auto px-6 py-2.5 rounded-lg text-white font-medium disabled:opacity-60"
            style={{ background: 'var(--color-brand)' }}
          >
            {submitting ? 'Sending…' : block.submitLabel}
          </button>
        </form>
      </div>
    </section>
  );
}

/**
 * Per-field input. Kept inside this file because it's coupled to the
 * editor's schema — no point exposing it more broadly.
 */
function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FormField;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const id = `f_${field.id}`;
  const baseClass =
    'w-full mt-1 px-3 py-2 rounded-lg border bg-white text-slate-900 placeholder-slate-400 ' +
    (error ? 'border-red-400' : 'border-slate-300');

  const label = (
    <label htmlFor={id} className="text-[13px] font-semibold text-slate-700">
      {field.label}
      {field.required && <span className="text-red-500"> *</span>}
    </label>
  );

  let control: React.ReactNode;
  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={baseClass}
          required={field.required}
        />
      );
      break;
    case 'select': {
      const opts = (field.options ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      control = (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
          required={field.required}
        >
          <option value="">{field.placeholder ?? 'Select…'}</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    }
    case 'checkbox':
      control = (
        <label className="flex items-start gap-2 mt-1.5 text-[14px] text-slate-700 cursor-pointer">
          <input
            id={id}
            type="checkbox"
            checked={value === 'yes'}
            onChange={(e) => onChange(e.target.checked ? 'yes' : '')}
            className="mt-1"
          />
          <span>{field.placeholder ?? field.label}</span>
        </label>
      );
      break;
    default:
      control = (
        <input
          id={id}
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
          required={field.required}
          inputMode={field.type === 'tel' ? 'tel' : undefined}
        />
      );
  }

  return (
    <div>
      {field.type !== 'checkbox' && label}
      {control}
      {error && <div className="text-red-600 text-[12px] mt-1">{error}</div>}
    </div>
  );
}

function initial(fields: FormField[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) out[f.name] = '';
  return out;
}
