'use client';

import { useState } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * App-wide providers wired in app/layout.tsx. Order:
 *   AntdRegistry → ConfigProvider → AntApp → QueryClient
 *
 * AntdRegistry handles SSR-safe CSS-in-JS extraction (no FOUC on first
 * paint). AntApp gives us imperative `message`, `notification`, `modal`
 * APIs.
 */
const BRAND = '#4f46e5';

export function Providers({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session — never recreated on re-renders.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: BRAND,
            borderRadius: 8,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
        }}
      >
        <AntApp>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </AntApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}
