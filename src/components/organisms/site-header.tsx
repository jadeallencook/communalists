import { useTranslations } from 'next-intl';
import { Suspense, type ReactNode } from 'react';

import { LocaleSwitcher } from '@/components/molecules/locale-switcher';
import { ThemeToggle } from '@/components/molecules/theme-toggle';
import { Link } from '@/i18n/navigation';

export interface SiteHeaderProps {
    /** Links before the language and theme controls (signed in: Dashboard). */
    nav?: ReactNode;
    /** After them: Sign in / Create account, or the account menu. */
    account?: ReactNode;
}

/** Top bar on every page: wordmark home link, navigation, language and theme, account. */
export function SiteHeader({ nav, account }: SiteHeaderProps) {
    const t = useTranslations('Header');

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
                <Link
                    href="/"
                    aria-label={t('home')}
                    className="shrink-0 font-heading text-lg font-semibold tracking-tight"
                >
                    Communalists
                </Link>
                <nav
                    aria-label={t('navigation')}
                    className="flex items-center gap-1"
                >
                    {nav}
                    {/* It reads the URL, which pages with params (like /org/[handle])
                        only know at request time: Next requires <Suspense> there. */}
                    <Suspense
                        fallback={<div aria-hidden className="h-8 w-24" />}
                    >
                        <LocaleSwitcher />
                    </Suspense>
                    <ThemeToggle />
                    {account}
                </nav>
            </div>
        </header>
    );
}
