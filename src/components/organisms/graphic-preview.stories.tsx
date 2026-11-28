import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { drawSample, SAMPLE_ALT, SAMPLE_CONTENT } from './graphic-fixtures';
import { GraphicPreview } from './graphic-preview';

const meta = {
    title: 'Components/Organisms/GraphicPreview',
    component: GraphicPreview,
    args: {
        canvasRef: drawSample(),
        aspect: 1,
        ready: true,
        overflow: [],
        alt: SAMPLE_ALT,
        save: fn(),
        copyStatus: 'idle',
        onCopyAlt: fn(),
    },
    decorators: [
        (Story) => (
            <div className="max-w-md">
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    'The live preview on /graphics, with Save, Share (only on devices that can share files) and the alt text to paste with the post. The canvas is an image to screen readers, described by the alt text. See Hooks/useGraphicEditor for it working end to end.',
            },
        },
    },
} satisfies Meta<typeof GraphicPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
/** Phones that can share files get a Share button (opens the share sheet). */
export const CanShare: Story = { args: { share: fn() } };
/** While the full-size file is made, Save is dimmed and says why. */
export const Loading: Story = { args: { ready: false } };
export const Saved: Story = {
    args: { notice: { kind: 'saved', file: 'free-store-square.png' } },
};
/** Text that didn't fit even at its smallest size. */
export const TextCutShort: Story = {
    args: {
        canvasRef: drawSample({
            content: {
                ...SAMPLE_CONTENT,
                details: 'Lots and lots of words. '.repeat(20),
            },
        }),
        overflow: ['details', 'place'],
    },
};
export const Story1080x1920: Story = {
    name: 'Story size',
    args: {
        canvasRef: drawSample({
            format: 'story',
            layout: 'block',
            palette: 'garden',
        }),
        aspect: 1080 / 1920,
    },
};
export const SaveFailed: Story = { args: { error: 'save' } };
export const AltCopied: Story = { args: { copyStatus: 'copied' } };
export const AltCopyFailed: Story = { args: { copyStatus: 'failed' } };
