import type { ResolvedMetadata } from 'next';
import { ThemeProvider } from '@/contexts/theme';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { createClient } from '@/prismicio';
import { Navbar } from '@/components/organisms/Navbar/Navbar.prismic';

import './globals.css';

export const generateMetadata = async (): Promise<ResolvedMetadata> => {
  const client = createClient();
  const { data } = await client.getSingle('meta');
  const { title, description } = data;
  const meta = { title, description };
  return meta as ResolvedMetadata;
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
