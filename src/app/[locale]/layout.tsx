import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { locale as rootLocale } from 'next/root-params';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { HeaderLinksPlaceholder } from '@/components/molecules/header-links';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { routing } from '@/i18n/routing';
import { currentBuild } from '@/lib/build-info';
import { isLocalDev, TEST_ACCOUNTS } from '@/lib/dev';
import { getSiteUrl } from '@/lib/site';

import { Analytics } from './analytics';
import { DefinitionsContainer } from './definitions-container';
import { DevToolbarContainer } from './dev-toolbar-container';
import { HeaderAccount, HeaderNav } from './header-slots';

import '../globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin', 'latin-ext', 'vietnamese'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin', 'latin-ext', 'vietnamese'],
});

// Required with Cache Components: every root param needs at least one value.
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Metadata');
    return {
        metadataBase: new URL(getSiteUrl()),
        title: { default: 'Communalists', template: '%s | Communalists' },
        description: t('description'),
    };
}

export default async function LocaleLayout({
    children,
}: LayoutProps<'/[locale]'>) {
    const locale = await rootLocale();
    if (!hasLocale(routing.locales, locale)) notFound();

    const t = await getTranslations('Header');

    return (
        <html
            lang={locale}
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="flex min-h-full flex-col">
                <NextIntlClientProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <a
                            href="#main"
                            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
                        >
                            {t('skipToContent')}
                        </a>
                        <SiteHeader
                            nav={
                                <Suspense fallback={null}>
                                    <HeaderNav />
                                </Suspense>
                            }
                            account={
                                <Suspense fallback={<HeaderLinksPlaceholder />}>
                                    <HeaderAccount />
                                </Suspense>
                            }
                        />
                        <main id="main" className="flex-1">
                            <DefinitionsContainer>
                                {children}
                            </DefinitionsContainer>
                        </main>
                        <SiteFooter build={currentBuild()} />
                        {/* Umami loads on production only; see technical/analytics.md. */}
                        <Analytics
                            load={process.env.VERCEL_ENV === 'production'}
                        />
                        {isLocalDev(process.env) && (
                            <DevToolbarContainer
                                accounts={TEST_ACCOUNTS.map(
                                    ({ email, summary, featured }) => ({
                                        email,
                                        summary,
                                        featured,
                                    })
                                )}
                            />
                        )}
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
