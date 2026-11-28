import { useTranslations } from 'next-intl';
import { Suspense, type ReactNode } from 'react';

import { LocaleSwitcher } from '@/components/molecules/locale-switcher';
import { ThemeToggle } from '@/components/molecules/theme-toggle';
import { Link } from '@/i18n/navigation';

export interface SiteHeaderProps {
    /** The site's sections (NavLinks), beside the wordmark on wide screens. */
    nav?: ReactNode;
    /**
     * After language and theme: Sign in / Create account or the account menu
     * on wide screens, plus the Menu button (MobileNav) below `lg`.
     */
    account?: ReactNode;
}

/**
 * Top bar on every page. Wide screens (`lg` up): wordmark, the site's
 * sections, then language, theme and account. Below that (phones, tablets,
 * 200% zoom): wordmark, language, and a Menu button holding everything else.
 */
export function SiteHeader({ nav, account }: SiteHeaderProps) {
    const t = useTranslations('Header');

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
                <Link
                    href="/"
                    aria-label={t('home')}
                    className="shrink-0 font-heading text-lg font-semibold tracking-tight"
                >
                    Communalists
                </Link>
                {/* Hidden below lg, which also hides the landmark: the
                    drawer has its own "Main" navigation there. */}
                <nav
                    aria-label={t('navigation')}
                    className="ms-4 hidden lg:block"
                >
                    {nav}
                </nav>
                <div className="ms-auto flex items-center gap-1">
                    {/* It reads the URL, which pages with params (like /organization/[handle])
                        only know at request time: Next requires <Suspense> there. */}
                    <Suspense
                        fallback={<div aria-hidden className="h-8 w-24" />}
                    >
                        <LocaleSwitcher />
                    </Suspense>
                    <div className="hidden lg:block">
                        <ThemeToggle />
                    </div>
                    {account}
                </div>
            </div>
        </header>
    );
}
