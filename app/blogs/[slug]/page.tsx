import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marketingApi, toBlogPost, type BlogPostView } from '@/lib/api';
import { SITE_URL } from '@/lib/seo';
import { BLOG_POSTS } from '@/data/marketing';
import { TrackPageview } from '@/components/TrackPageview';

interface Params {
  slug: string;
}

export const revalidate = 600;
// Allow on-demand SSR for slugs not in generateStaticParams (e.g. a post
// published after the last build). Unknown slugs hit notFound() below.
export const dynamicParams = true;

/**
 * Pre-render the seed posts at build time. Posts published later via the
 * admin CMS render on-demand the first time someone visits, then cache.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const live = await marketingApi.listBlogPosts();
  const slugs = new Set<string>();
  if (live) for (const p of live) if (p?.slug) slugs.add(p.slug);
  for (const p of BLOG_POSTS) slugs.add(p.slug);
  return Array.from(slugs).map((slug) => ({ slug }));
}

async function loadPost(slug: string): Promise<BlogPostView | null> {
  let live: any = await marketingApi.getBlogPost(slug);
  if (live?.slug) return toBlogPost(live);
  const fallback = BLOG_POSTS.find((p) => p.slug === slug);
  if (!fallback) return null;
  return {
    ...fallback,
    image: fallback.image ?? null,
    metaData: fallback.metaData ?? null,
  } as BlogPostView;
}

async function loadRelated(currentSlug: string, currentTag: string): Promise<BlogPostView[]> {
  // Prefer live posts so the "Read next" list updates automatically when
  // the admin publishes something. Fall back to seed when the API is empty.
  const live = await marketingApi.listBlogPosts();
  const all: BlogPostView[] = live && live.length > 0
    ? live.map(toBlogPost)
    : (BLOG_POSTS as BlogPostView[]);
  const others = all.filter((p) => p.slug !== currentSlug);
  // Same-tag first, then everything else; cap at 3.
  const sameTag = others.filter((p) => p.tag === currentTag);
  const rest = others.filter((p) => p.tag !== currentTag);
  return [...sameTag, ...rest].slice(0, 3);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: 'Post not found — EduSphere' };

  const seo = (post.metaData?.seo as Record<string, string> | undefined) ?? {};
  const title = seo.metaTitle || `${post.title} — EduSphere`;
  const description =
    seo.metaDescription || post.excerpt || 'Read latest blogs and education insights.';
  const image =
    (post.metaData?.image as string | undefined) ||
    post.image ||
    `${SITE_URL}/og-default.png`;
  const canonical = `${SITE_URL}/blogs/${post.slug}`;

  return {
    title,
    description,
    keywords:
      seo.keywords || 'LMS blog, school management, education platform, coaching software',
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      images: [{ url: image }],
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1 -translate-y-px">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ShareLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
  >
    {children}
  </a>
);

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return notFound();

  const related = await loadRelated(post.slug, post.tag);
  const canonical = `${SITE_URL}/blogs/${post.slug}`;
  const shareTitle = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(canonical);

  return (
    <>
      <TrackPageview event="viewed_blog_post" metadata={{ slug }} />

      <article className="pt-12 pb-20">
        <div className="max-w-[760px] mx-auto px-5">
          {/* Breadcrumb */}
          <nav className="text-[13px] text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blogs" className="hover:text-slate-900">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700 line-clamp-1">{post.title}</span>
          </nav>

          <Link
            href="/blogs"
            className="text-sm font-medium"
            style={{ color: 'var(--color-brand)' }}
          >
            <ArrowLeft />All posts
          </Link>

          {/* Cover — plain <img> so any HTTPS image host works without
              tripping next/image's hostname allowlist at runtime. */}
          {post.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={post.image}
              alt={post.title}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-auto rounded-2xl mt-5 mb-6"
              style={{ objectFit: 'cover', maxHeight: 420 }}
            />
          ) : (
            <div
              className="rounded-2xl mt-5 mb-6"
              style={{ height: 220, background: post.cover }}
              aria-hidden
            />
          )}

          {/* Tags — each links to the filtered blog list. Render
              metadata.tags (array) when present, else fall back to the
              single tag the normalizer emits. */}
          <div className="flex flex-wrap gap-1.5">
            {((Array.isArray(post?.metaData?.tags) && (post.metaData!.tags as string[])) || [post.tag])
              .filter((t): t is string => typeof t === 'string' && t.length > 0)
              .map((item) => (
                <Link
                  key={item}
                  href={`/blogs?tag=${encodeURIComponent(item)}`}
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80"
                  style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-600)' }}
                >
                  {item}
                </Link>
              ))}
          </div>

          {/* Title */}
          <h1
            className="font-extrabold text-slate-900 mt-3 mb-3"
            style={{ fontSize: 'clamp(26px,4vw,40px)', lineHeight: 1.15 }}
          >
            {post.title}
          </h1>

          {/* Byline */}
          <div className="flex items-center gap-3 text-[13px] text-slate-500 mb-6">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--color-brand)' }}
              aria-hidden
            >
              {post.author.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-slate-900 font-medium">{post.author}</div>
              <div>
                {new Date(post.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}{' '}
                · {post.readMins} min read
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <p
            className="text-[18px] text-slate-700 leading-relaxed font-medium border-l-4 pl-4 mb-8"
            style={{ borderColor: 'var(--color-brand-100)' }}
          >
            {post.excerpt}
          </p>

          {/* Body — rich HTML authored by trusted platform staff */}
          <div
            className="prose"
            style={{ fontSize: 16, color: '#475569', lineHeight: 1.9 }}
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {/* Share row */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-500 mr-1">Share:</span>
            <ShareLink
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              label="Share on Twitter"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.244 2H21.5l-7.5 8.55L23 22h-6.844l-5.36-7.07L4.6 22H1.34l8.025-9.15L1 2h7.014l4.846 6.46L18.244 2zm-2.4 18h1.86L7.27 4H5.296L15.844 20z" />
              </svg>
            </ShareLink>
            <ShareLink
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              label="Share on LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19 0h-14C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z" />
              </svg>
            </ShareLink>
            <ShareLink
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              label="Share on Facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.099 1.893-4.785 4.659-4.785 1.325 0 2.464.099 2.796.143v3.241l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
            </ShareLink>
            <a
              href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
              aria-label="Share via email"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-[1100px] mx-auto px-5">
            <h2 className="text-[22px] font-extrabold text-slate-900 mb-6">Read next</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blogs/${p.slug}`}
                  className="bg-white rounded-[14px] overflow-hidden border border-slate-100 hover:shadow-md transition-shadow"
                >
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-[150px] object-cover"
                    />
                  ) : (
                    <div style={{ height: 150, background: p.cover }} aria-hidden />
                  )}
                  <div className="p-5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ background: 'var(--color-brand-100)', color: 'var(--color-brand-600)' }}
                    >
                      {p.tag}
                    </span>
                    <div className="font-bold text-[16px] text-slate-900 mt-2 mb-1.5">{p.title}</div>
                    <div className="text-slate-500 text-[13px] leading-relaxed line-clamp-3">
                      {p.excerpt}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JSON-LD Article structured data — helps Google show this in Discover */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.image ? [post.image] : undefined,
            datePublished: post.date,
            dateModified: post.date,
            author: { '@type': 'Organization', name: post.author },
            publisher: {
              '@type': 'Organization',
              name: 'EduSphere',
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/og-default.png` },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          }),
        }}
      />
    </>
  );
}
