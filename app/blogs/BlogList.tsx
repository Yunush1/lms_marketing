'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button, Empty, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { BlogPostView } from '@/lib/api';
import { useSubmitLead } from '@/hooks/useSubmitLead';
import { logEvent, useTrackPageview } from '@/lib/audit';

const wrap: React.CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '0 20px' };

interface Props {
  posts: BlogPostView[];
  /** Tag set via ?tag= in the URL (server-filtered). null = all posts. */
  activeTag: string | null;
}

/**
 * Collect tags shown on cards — preferring metadata.tags (array) and
 * falling back to the singular `tag` field that `toBlogPost` emits.
 */
function postTags(p: BlogPostView): string[] {
  const meta = p.metaData as { tags?: unknown } | null | undefined;
  if (Array.isArray(meta?.tags)) {
    return (meta!.tags as unknown[]).filter((t): t is string => typeof t === 'string');
  }
  return p.tag ? [p.tag] : [];
}

export function BlogList({ posts, activeTag }: Props) {
  useTrackPageview('viewed_blog_list', activeTag ? { tag: activeTag } : undefined);
  const submit = useSubmitLead();
  const [query, setQuery] = useState('');

  // Show every tag that appears across the current result set so users can
  // browse adjacent tags from a filtered view too.
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const p of posts) for (const t of postTags(p)) tags.add(t);
    return Array.from(tags).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? '').toLowerCase().includes(q) ||
        postTags(p).some((t) => t.toLowerCase().includes(q)),
    );
  }, [posts, query]);

  const subscribe = async (email: string) => {
    if (!email) return;
    await submit.mutateAsync({
      name: email.split('@')[0],
      email,
      source: 'blog_newsletter',
      message: 'Subscribed to the blog newsletter',
    });
    logEvent({ event: 'newsletter_subscribed', metadata: { source: 'blog' } });
  };

  return (
    <>
      <section style={{ padding: '64px 0 24px' }}>
        <div style={wrap}>
          <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            From the blog
          </h1>
          <p style={{ color: '#64748b', fontSize: 17, marginTop: 12, marginBottom: 24 }}>
            Playbooks, ideas and product updates for running a modern school.
          </p>

          {/* Active-tag banner (only when filtered) */}
          {activeTag && (
            <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-[10px]"
                 style={{ background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-100)' }}>
              <div className="text-[14px] text-slate-700">
                Showing posts tagged{' '}
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-[12px] font-semibold ml-1"
                  style={{ background: 'var(--color-brand)', color: '#fff' }}
                >
                  {activeTag}
                </span>{' '}
                <span className="text-slate-500">· {posts.length} {posts.length === 1 ? 'post' : 'posts'}</span>
              </div>
              <Link
                href="/blogs"
                className="text-[13px] font-medium hover:underline"
                style={{ color: 'var(--color-brand)' }}
              >
                Clear filter
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search posts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ maxWidth: 320 }}
              allowClear
            />
            {/* Tag chips — each is a real link so it can be opened in a new
                tab, shared, indexed by search engines, etc. */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Link
                href="/blogs"
                onClick={() => logEvent({ event: 'blog_filter_tag', metadata: { tag: 'all' } })}
                className={`px-3 py-1 rounded-full border text-[13px] transition-colors ${
                  !activeTag
                    ? 'text-white'
                    : 'text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
                style={
                  !activeTag
                    ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }
                    : undefined
                }
              >
                All
              </Link>
              {allTags.map((t) => {
                const selected = activeTag?.toLowerCase() === t.toLowerCase();
                return (
                  <Link
                    key={t}
                    href={`/blogs?tag=${encodeURIComponent(t)}`}
                    onClick={() => logEvent({ event: 'blog_filter_tag', metadata: { tag: t } })}
                    className={`px-3 py-1 rounded-full border text-[13px] transition-colors ${
                      selected
                        ? 'text-white'
                        : 'text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                    style={
                      selected
                        ? { background: 'var(--color-brand)', borderColor: 'var(--color-brand)' }
                        : undefined
                    }
                  >
                    {t}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 56 }}>
        <div style={wrap}>
          {filtered.length === 0 ? (
            <Empty
              description={
                activeTag
                  ? `No posts tagged "${activeTag}" yet.`
                  : 'No posts match your filters yet.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '56px 0 80px' }}>
        <div style={{ ...wrap, maxWidth: 720 }}>
          <div
            style={{
              borderRadius: 18,
              padding: '36px 28px',
              background: 'linear-gradient(135deg,#eef2ff,#f8fafc)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
              Monthly playbooks for school operators
            </div>
            <div style={{ color: '#475569', marginTop: 6, marginBottom: 18, fontSize: 14 }}>
              One short email. Practical ideas, no fluff. Unsubscribe any time.
            </div>
            <NewsletterForm onSubmit={subscribe} loading={submit.isPending} />
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * One blog card. The card itself is a Link to the post; tag chips inside
 * are sibling Links so clicking a tag jumps to the filtered list instead
 * of opening the post. We stop click propagation on the tag link so the
 * outer card link doesn't also fire.
 */
function BlogCard({ post }: { post: BlogPostView }) {
  const tags = postTags(post);
  const onTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    logEvent({ event: 'blog_card_tag_click', metadata: { tag, slug: post.slug } });
  };

  return (
    <div className="relative bg-white rounded-[14px] overflow-hidden border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
      <Link
        href={`/blogs/${post.slug}`}
        onClick={() =>
          logEvent({
            event: 'clicked_blog_post',
            entityId: post.slug,
            metadata: { title: post.title, tags },
          })
        }
        className="absolute inset-0 z-0"
        aria-label={post.title}
      />
      {post.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          className="w-full h-[180px] object-cover relative z-0 pointer-events-none"
        />
      ) : (
        <div
          style={{ height: 180, background: post.cover }}
          className="relative z-0 pointer-events-none"
          aria-hidden
        />
      )}
      <div className="p-5 flex-1 flex flex-col relative z-0 pointer-events-none">
        {/* Tag chips — re-enable pointer events so they can be clicked. */}
        <div className="flex flex-wrap gap-1.5 pointer-events-auto relative z-10">
          {tags.slice(0, 3).map((t) => (
            <Link
              key={t}
              href={`/blogs?tag=${encodeURIComponent(t)}`}
              onClick={(e) => onTagClick(e, t)}
              className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium hover:opacity-80"
              style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-600)' }}
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="font-bold text-[17px] text-slate-900 mt-2.5 mb-1.5 line-clamp-2">
          {post.title}
        </div>
        <div className="text-slate-500 text-[14px] leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </div>
        <div className="text-slate-400 text-[12px] mt-3">
          {post.author} ·{' '}
          {new Date(post.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}{' '}
          · {post.readMins} min read
        </div>
      </div>
    </div>
  );
}

function NewsletterForm({
  onSubmit,
  loading,
}: {
  onSubmit: (email: string) => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(email);
        setEmail('');
      }}
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.com"
        size="large"
        style={{ flex: 1, minWidth: 220 }}
      />
      <Button type="primary" size="large" htmlType="submit" loading={loading}>
        Subscribe
      </Button>
    </form>
  );
}
