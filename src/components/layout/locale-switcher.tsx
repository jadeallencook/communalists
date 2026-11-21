'use client';

import { LanguagesIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeNames, routing, type Locale } from '@/i18n/routing';

export function LocaleSwitcher() {
    const t = useTranslations('LocaleSwitcher');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onChange = (next: string) => {
        startTransition(() => {
            router.replace(pathname, { locale: next as Locale });
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isPending}>
                    <LanguagesIcon aria-hidden />
                    <span>{localeNames[locale as Locale]}</span>
                    <span className="sr-only">{t('label')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('label')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={locale} onValueChange={onChange}>
                    {routing.locales.map((value) => (
                        <DropdownMenuRadioItem
                            key={value}
                            value={value}
                            lang={value}
                        >
                            {localeNames[value]}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
