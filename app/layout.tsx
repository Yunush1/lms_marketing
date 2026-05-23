import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://edusphere.app',
  ),
  title: {
    default: 'EduSphere — The operating system for modern schools',
    template: '%s',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
