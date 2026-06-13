import type { Metadata } from 'next';
import { marketingApi, toBlogPost, type BlogPostView } from '@/lib/api';
import { buildPageMetadata } from '@/lib/seo';
import { BLOG_POSTS } from '@/data/marketing';
import { BlogList } from './BlogList';

export const revalidate = 600;

interface BlogSearchParams {
  tag?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}): Promise<Metadata> {
  const { tag } = await searchParams;
  if (tag) {
    return buildPageMetadata({
      slug: 'blog',
      title: `Posts tagged "${tag}" — EduSphere blog`,
      bareTitle: true,
      description: `Latest EduSphere blog posts tagged "${tag}".`,
      path: `/blogs?tag=${encodeURIComponent(tag)}`,
      // Avoid duplicate-content penalties on tag-filtered pages.
      noindex: true,
    });
  }
  return buildPageMetadata({
    slug: 'blog',
    title: 'Blog',
    description: 'Playbooks, ideas and product updates for running a modern school.',
    path: '/blogs',
  });
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>;
}) {
  const { tag } = await searchParams;
  const live = await marketingApi.listBlogPosts(tag ? { tag } : undefined);
  let posts: BlogPostView[];
  if (live && live.length > 0) {
    posts = live.map(toBlogPost);
  } else if (tag) {
    // Backend returned nothing for this tag — filter the seed the same way
    // so /blogs?tag=Finance still renders something useful in dev.
    const wanted = tag.toLowerCase();
    posts = (BLOG_POSTS as BlogPostView[]).filter(
      (p) => (p.tag ?? '').toLowerCase() === wanted,
    );
  } else {
    posts = BLOG_POSTS as BlogPostView[];
  }

  return <BlogList posts={posts} activeTag={tag ?? null} />;
}
