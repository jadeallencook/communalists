import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import foodServe from '@/assets/food-serve.jpg';
import { Button } from '@/components/atoms/button';

import { HeroBanner } from './hero-banner';

const meta = {
    title: 'Components/Organisms/Hero Banner',
    component: HeroBanner,
    parameters: { layout: 'fullscreen' },
    args: {
        image: foodServe,
        imageAlt: 'A volunteer hands a plate of hot food to a neighbor',
        title: 'This is what community looks like',
        subtitle:
            'Find your community and discover meaningful causes. Connect with the people and organizations working to make a difference. Share resources, get involved, and create lasting change together.',
    },
} satisfies Meta<typeof HeroBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        action: (
            <Button
                size="lg"
                className="bg-white text-neutral-950 hover:bg-white/90"
            >
                Create account
            </Button>
        ),
    },
};

export const TitleOnly: Story = {
    args: { subtitle: undefined },
};

export const LongTitle: Story = {
    args: {
        title: 'Chào mừng bạn đến với mạng lưới tương trợ của khu phố chúng ta',
    },
};
