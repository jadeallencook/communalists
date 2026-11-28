import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { sampleThumbnails } from '@/components/organisms/graphic-fixtures';
import { PALETTES } from '@/lib/graphics';

import { ThumbnailChoice } from './thumbnail-choice';

const meta = {
    title: 'Components/Molecules/ThumbnailChoice',
    component: ThumbnailChoice,
    args: {
        name: 'layout',
        legend: 'Layout',
        value: 'stripe',
        onChange: fn(),
        groups: [],
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Pick one option by its picture. Native radio buttons underneath (arrow keys move between them), named by their text; the chosen one has a thicker border and a check, not only colour. Groups get their own headings.',
            },
        },
    },
} satisfies Meta<typeof ThumbnailChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pictures: Story = {
    loaders: [async () => ({ thumbnails: await sampleThumbnails() })],
    render: (args, { loaded }) => {
        const layouts = (
            loaded.thumbnails as Awaited<ReturnType<typeof sampleThumbnails>>
        ).layouts;
        return (
            <ThumbnailChoice
                {...args}
                groups={[
                    {
                        label: 'Suggested for Free store',
                        options: [
                            {
                                value: 'stripe',
                                label: 'Stripe',
                                image: layouts.stripe,
                            },
                            {
                                value: 'centered',
                                label: 'Centered',
                                image: layouts.centered,
                            },
                        ],
                    },
                    {
                        label: 'Words only',
                        options: [
                            {
                                value: 'bold',
                                label: 'Big words',
                                image: layouts.bold,
                            },
                            {
                                value: 'frame',
                                label: 'Framed',
                                image: layouts.frame,
                            },
                        ],
                    },
                ]}
            />
        );
    },
};
/** Pictures are drawn after typing pauses; until then, placeholders hold their space. */
export const Loading: Story = {
    args: {
        groups: [
            {
                options: [
                    { value: 'stripe', label: 'Stripe' },
                    { value: 'bold', label: 'Big words' },
                    { value: 'frame', label: 'Framed' },
                ],
            },
        ],
    },
};
export const Swatches: Story = {
    args: {
        name: 'palette',
        legend: 'Colors',
        hint: 'Every set is easy to read, including for people with low vision.',
        value: 'rose',
        size: 'wide',
        groups: [
            {
                options: (['rose', 'paper', 'night', 'grape'] as const).map(
                    (key) => ({
                        value: key,
                        label: key[0].toUpperCase() + key.slice(1),
                        swatches: [
                            PALETTES[key].background,
                            PALETTES[key].accent,
                            PALETTES[key].text,
                        ],
                    })
                ),
            },
        ],
    },
};
