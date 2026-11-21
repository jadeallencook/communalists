import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SiteFooter } from '@/components/organisms/site-footer';
import { SiteHeader } from '@/components/organisms/site-header';

import { HomePage } from './home-page';

const meta = {
    title: 'Pages/Home',
    component: HomePage,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <>
                <SiteHeader />
                <main>
                    <Story />
                </main>
                <SiteFooter />
            </>
        ),
    ],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
