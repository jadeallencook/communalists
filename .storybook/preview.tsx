import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import en from '../messages/en.json';
import es from '../messages/es.json';
import vi from '../messages/vi.json';
import zh from '../messages/zh.json';

import '../src/app/globals.css';

// Same fonts as src/app/[locale]/layout.tsx, which Storybook doesn't render.
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin', 'latin-ext', 'vietnamese'],
});
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin', 'latin-ext', 'vietnamese'],
});

const messages = { en, es, vi, zh };
type StoryLocale = keyof typeof messages;

function StoryProviders({
    locale,
    theme,
    fullscreen,
    children,
}: {
    locale: StoryLocale;
    theme: string;
    fullscreen: boolean;
    children: ReactNode;
}) {
    useEffect(() => {
        const html = document.documentElement;
        // Font variables go on <html>, like the app's root layout, so content
        // that Radix portals to <body> (dropdowns, dialogs, tooltips) gets
        // Geist too. On a wrapper div, portaled content falls back to serif.
        html.classList.add(
            geistSans.variable,
            geistMono.variable,
            'antialiased'
        );
        html.classList.toggle('dark', theme === 'dark');
        html.lang = locale;
    }, [theme, locale]);

    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages[locale]}
            timeZone="America/Los_Angeles"
        >
            {/* Full-width stories (pages, headers, banners) get no padding. */}
            <div
                className={`min-h-screen bg-background text-foreground ${fullscreen ? '' : 'p-4'}`}
            >
                {children}
            </div>
        </NextIntlClientProvider>
    );
}

// Wraps every story in the same providers the app uses, driven by the
// Locale and Theme toolbar menus.
const withProviders: Decorator = (Story, context) => (
    <StoryProviders
        locale={(context.globals.locale ?? 'en') as StoryLocale}
        theme={context.globals.theme ?? 'light'}
        fullscreen={context.parameters.layout === 'fullscreen'}
    >
        <Story />
    </StoryProviders>
);

const preview: Preview = {
    decorators: [withProviders],
    globalTypes: {
        locale: {
            description: 'Locale',
            toolbar: {
                title: 'Locale',
                icon: 'globe',
                items: [
                    { value: 'en', title: 'English' },
                    { value: 'es', title: 'Español' },
                    { value: 'vi', title: 'Tiếng Việt' },
                    { value: 'zh', title: '中文' },
                ],
                dynamicTitle: true,
            },
        },
        theme: {
            description: 'Theme',
            toolbar: {
                title: 'Theme',
                icon: 'contrast',
                items: [
                    { value: 'light', title: 'Light' },
                    { value: 'dark', title: 'Dark' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { locale: 'en', theme: 'light' },
    parameters: {
        options: {
            // The categories every story must use (see AGENTS.md).
            storySort: {
                order: [
                    'Documentation',
                    [
                        'Overview',
                        'Getting Started',
                        'Agents Guide',
                        'Decisions',
                        ['Decision Log', '*'],
                        'Features',
                        'Technical',
                        ['*', 'Prototype'],
                    ],
                    'Components',
                    ['Atoms', 'Molecules', 'Organisms'],
                    'Pages',
                    'Hooks',
                ],
            },
        },
        nextjs: { appDirectory: true },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        // Report accessibility violations in the a11y panel.
        a11y: { test: 'todo' },
    },
};

export default preview;
