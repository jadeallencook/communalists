'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { Button } from '@/components/atoms/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu';

const THEMES = [
    { value: 'light', Icon: SunIcon },
    { value: 'dark', Icon: MoonIcon },
    { value: 'system', Icon: MonitorIcon },
] as const;

/**
 * The same choice laid out as three buttons, for the phone menu. The chosen
 * one is filled and pressed (`aria-pressed`), so it isn't shown by colour alone.
 */
export function ThemeOptions() {
    const t = useTranslations('ThemeToggle');
    const { theme, setTheme } = useTheme();

    return (
        <div role="group" aria-labelledby="theme-options-label">
            <p
                id="theme-options-label"
                className="mb-2 text-xs text-muted-foreground"
            >
                {t('heading')}
            </p>
            <div className="flex flex-wrap gap-2">
                {THEMES.map(({ value, Icon }) => (
                    <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={theme === value ? 'default' : 'outline'}
                        aria-pressed={theme === value}
                        onClick={() => setTheme(value)}
                    >
                        <Icon aria-hidden />
                        {t(value)}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export function ThemeToggle() {
    const t = useTranslations('ThemeToggle');
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('label')}>
                    <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <SunIcon aria-hidden /> {t('light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <MoonIcon aria-hidden /> {t('dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <MonitorIcon aria-hidden /> {t('system')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
