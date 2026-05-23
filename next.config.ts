import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow any HTTPS image host for now. Blog covers, OG images and CMS
  // uploads can come from many places (S3, backend uploads, partner CDNs);
  // the safest default for the marketing site is to trust HTTPS images and
  // let `<img>` (or `next/image` with unoptimized) handle them.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  trailingSlash: false,
  reactStrictMode: true,
};

export default nextConfig;
