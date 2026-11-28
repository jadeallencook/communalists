import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { locale as rootLocale } from 'next/root-params';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import {
    HeaderLinksPlaceholder,
    NavLinks,
} from '@/components/molecules/header-links';
import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { routing, type Locale } from '@/i18n/routing';
import { currentBuild } from '@/lib/build-info';
import { isLocalDev, TEST_ACCOUNTS } from '@/lib/dev';
import { navItemsFor } from '@/lib/navigation';
import { keywordList } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';

import { Analytics } from './analytics';
import { DefinitionsContainer } from './definitions-container';
import { DevToolbarContainer } from './dev-toolbar-container';
import { HeaderAccount, HeaderNav } from './header-slots';
import { SITE_NAME, socialDefaults } from './page-metadata';

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

// Defaults for every page; public pages add their own through pageMetadata()
// (documentation/technical/seo.md). No canonical here: children would
// inherit the wrong one.
export async function generateMetadata(): Promise<Metadata> {
    const locale = (await rootLocale()) as Locale;
    const t = await getTranslations('Metadata');
    const social = await socialDefaults(locale);
    return {
        metadataBase: new URL(getSiteUrl()),
        title: {
            default: t('homeTitle'),
            template: `%s | ${SITE_NAME}`,
        },
        description: t('description'),
        applicationName: SITE_NAME,
        keywords: keywordList(t('keywords')),
        openGraph: {
            ...social.openGraph,
            type: 'website',
            title: t('homeTitle'),
            description: t('description'),
        },
        twitter: social.twitter,
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
                                // The public sections paint at once; Dashboard
                                // joins at the end once the session is known.
                                <Suspense
                                    fallback={
                                        <NavLinks
                                            links={navItemsFor(false).map(
                                                ({ key, href }) => ({
                                                    key,
                                                    href,
                                                })
                                            )}
                                        />
                                    }
                                >
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
