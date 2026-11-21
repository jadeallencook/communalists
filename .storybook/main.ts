import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: '@storybook/nextjs-vite',
    staticDirs: ['../public'],
    // Next compiles Tailwind through the Turbopack loader in next.config.ts,
    // which Storybook's Vite build never sees. Without this plugin,
    // globals.css ships with tokens but no utility classes.
    viteFinal: async (viteConfig) => {
        viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
        return viteConfig;
    },
};
export default config;
