import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect, type ReactNode } from 'react';

import en from '../messages/en.json';
import es from '../messages/es.json';
import vi from '../messages/vi.json';
import zh from '../messages/zh.json';

import '../src/app/globals.css';

const messages = { en, es, vi, zh };
type StoryLocale = keyof typeof messages;

function StoryProviders({
    locale,
    theme,
    children,
}: {
    locale: StoryLocale;
    theme: string;
    children: ReactNode;
}) {
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.lang = locale;
    }, [theme, locale]);

    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages[locale]}
            timeZone="America/Los_Angeles"
        >
            <div className="bg-background p-4 text-foreground">{children}</div>
        </NextIntlClientProvider>
    );
}

// Wraps every story in the same providers the app uses, driven by the
// Locale and Theme toolbar menus.
const withProviders: Decorator = (Story, context) => (
    <StoryProviders
        locale={(context.globals.locale ?? 'en') as StoryLocale}
        theme={context.globals.theme ?? 'light'}
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
