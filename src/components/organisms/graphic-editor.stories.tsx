import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { FillFromOrganization, GraphicEditor } from './graphic-editor';
import { SAMPLE_CONTENT, sampleThumbnails } from './graphic-fixtures';

const ORGANIZATIONS = [
    { handle: 'sbma', name: 'South Bay Mutual Aid' },
    { handle: 'oakland-auto-club', name: 'Oakland Auto Club' },
];

const meta = {
    title: 'Components/Organisms/GraphicEditor',
    component: GraphicEditor,
    args: {
        step: 'template',
        setStep: fn(),
        thumbnails: { templates: {}, layouts: {} },
        layoutChoices: {
            suggested: ['stripe', 'centered', 'block'],
            rest: ['bold', 'frame', 'reverse', 'photo-below'],
        },
        paletteChoices: {
            suggested: ['rose', 'sun', 'mint'],
            rest: [
                'paper',
                'night',
                'garden',
                'sky',
                'clay',
                'grape',
                'ocean',
                'forest',
                'punk',
            ],
        },
        switchToPhotoLayout: fn(),
        aspect: 1,
        template: 'free-store',
        setTemplate: fn(),
        format: 'square',
        setFormat: fn(),
        layout: 'stripe',
        setLayout: fn(),
        palette: 'rose',
        setPalette: fn(),
        graphicLocale: 'en',
        setGraphicLocale: fn(),
        content: SAMPLE_CONTENT,
        setField: fn(),
        linkInvalid: false,
        hasPhoto: false,
        pickPhoto: fn(),
        removePhoto: fn(),
        photoFocus: 'center',
        setPhotoFocus: fn(),
        hasLogo: false,
        pickLogo: fn(),
        removeLogo: fn(),
        ready: true,
        save: fn(),
        fillSlot: (
            <FillFromOrganization signInHref="/sign-in?next=%2Fgraphics" />
        ),
    },
    loaders: [async () => ({ thumbnails: await sampleThumbnails() })],
    render: (args, { loaded }) => (
        <GraphicEditor
            {...args}
            thumbnails={
                (loaded.thumbnails as typeof args.thumbnails) ?? args.thumbnails
            }
        />
    ),
    decorators: [
        (Story) => (
            <div className="max-w-2xl">
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                component:
                    "The form on /graphics, one step at a time: what it's for, words, photo and logo, then the look (size, layout, colours, language). Templates and layouts are picked by their pictures, drawn with the person's own words; suggestions for the template come first. Nothing is dragged or resized. See Hooks/useGraphicEditor for it working end to end.",
            },
        },
    },
} satisfies Meta<typeof GraphicEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhatItsFor: Story = { name: "Step 1: What's it for" };
/** Signed out: the optional fields fold under "More". */
export const Words: Story = { name: 'Step 2: Words', args: { step: 'words' } };
/** A member can fill in the host, link, address and logo from one of their organizations. */
export const WordsSignedIn: Story = {
    name: 'Step 2: Words, signed in',
    args: {
        step: 'words',
        fillSlot: (
            <FillFromOrganization organizations={ORGANIZATIONS} fill={fn()} />
        ),
    },
};
export const WordsFillFailed: Story = {
    name: 'Step 2: Fill in failed',
    args: {
        step: 'words',
        fillSlot: (
            <FillFromOrganization
                organizations={ORGANIZATIONS}
                fill={fn()}
                error
            />
        ),
    },
};
/** A bad link opens "More" by itself, with the error next to the field. */
export const WordsLinkNotValid: Story = {
    name: 'Step 2: Link not valid',
    args: {
        step: 'words',
        content: { ...SAMPLE_CONTENT, link: 'not a link' },
        linkInvalid: true,
    },
};
export const Pictures: Story = {
    name: 'Step 3: Photo and logo',
    args: { step: 'pictures' },
};
/** With a layout that shows the photo, people choose which part to keep. */
export const PicturesWithPhoto: Story = {
    name: 'Step 3: With a photo',
    args: { step: 'pictures', layout: 'block', hasPhoto: true, hasLogo: true },
};
/** Other layouts say the photo isn't shown and offer to switch. */
export const PicturesPhotoNotShown: Story = {
    name: 'Step 3: Photo not shown',
    args: { step: 'pictures', hasPhoto: true },
};
export const PicturesFailed: Story = {
    name: 'Step 3: Picture failed',
    args: { step: 'pictures', error: 'picture' },
};
/** The last step ends with Save (and Share on devices that can). */
export const Look: Story = {
    name: 'Step 4: Look',
    args: { step: 'look', share: fn() },
};
/** While the pictures are drawn, the pickers show placeholders. */
export const LookLoading: Story = {
    name: 'Step 4: Pictures loading',
    args: { step: 'look' },
    loaders: [async () => ({ thumbnails: { templates: {}, layouts: {} } })],
};
