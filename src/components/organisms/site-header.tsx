import { useTranslations } from 'next-intl';

import { LocaleSwitcher } from '@/components/molecules/locale-switcher';
import { ThemeToggle } from '@/components/molecules/theme-toggle';
import { Link } from '@/i18n/navigation';

/** Top bar on every page: wordmark home link, language and theme controls. */
export function SiteHeader() {
    const t = useTranslations('Header');

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Link
                    href="/"
                    aria-label={t('home')}
                    className="font-heading text-lg font-semibold tracking-tight"
                >
                    Communalists
                </Link>
                <div className="flex items-center gap-1">
                    <LocaleSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
