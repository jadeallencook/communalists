import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Avatar } from './avatar';
import { sampleOrgPhoto, samplePersonPhoto } from './photo-fixtures';

const meta = {
    title: 'Components/Molecules/Avatar',
    component: Avatar,
    args: { name: 'Maya Thompson', size: 'lg' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Photo: Story = { args: { photoUrl: samplePersonPhoto } };
export const Organization: Story = {
    args: {
        name: 'South Bay Mutual Aid',
        shape: 'rounded',
        photoUrl: sampleOrgPhoto,
    },
};
export const OrganizationInitials: Story = {
    args: { name: 'South Bay Mutual Aid', shape: 'rounded' },
};
/** Every size, with and without a photo. */
export const Sizes: Story = {
    render: (args) => (
        <div className="flex flex-col gap-4">
            {(['circle', 'rounded'] as const).map((shape) => (
                <div key={shape} className="flex items-center gap-4">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                        <Avatar
                            key={size}
                            {...args}
                            shape={shape}
                            size={size}
                        />
                    ))}
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                        <Avatar
                            key={`photo-${size}`}
                            {...args}
                            shape={shape}
                            size={size}
                            photoUrl={
                                shape === 'circle'
                                    ? samplePersonPhoto
                                    : sampleOrgPhoto
                            }
                        />
                    ))}
                </div>
            ))}
        </div>
    ),
};
/** Chinese names show one character. */
export const SingleCharacter: Story = { args: { name: '王小明' } };
