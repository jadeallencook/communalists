import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Avatar } from './avatar';
import { SAMPLE_LOGO, SAMPLE_PHOTO } from './photo-fixtures';

const meta = {
    title: 'Components/Molecules/Avatar',
    component: Avatar,
    args: { name: 'Maya Thompson', size: 64 },
    parameters: {
        docs: {
            description: {
                component:
                    'A photo or logo, or initials. Decorative (hidden from screen readers): the name is always written next to it. Falls back to initials if the link stops working.',
            },
        },
    },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Photo: Story = { args: { photo: SAMPLE_PHOTO } };
/** Organizations: a rounded square, so text in a logo isn't clipped. */
export const Logo: Story = {
    args: {
        name: 'South Bay Mutual Aid',
        photo: SAMPLE_LOGO,
        shape: 'square',
    },
};
export const LogoInitials: Story = {
    args: { name: 'South Bay Mutual Aid', shape: 'square' },
};
/** The header's account button. */
export const PrimarySmall: Story = { args: { size: 28, tone: 'primary' } };
/** A link that no longer works (changed or removed): initials instead. */
export const BrokenLink: Story = {
    args: { photo: 'https://example.invalid/gone.webp' },
};
/** Names in scripts without capitals show one character. */
export const ChineseName: Story = { args: { name: '王小明' } };
/** Every size used in the app. */
export const Sizes: Story = {
    render: (args) => (
        <div className="flex items-end gap-3">
            {[28, 36, 44, 64, 80, 96].map((size) => (
                <Avatar key={size} {...args} size={size} photo={SAMPLE_PHOTO} />
            ))}
        </div>
    ),
};
