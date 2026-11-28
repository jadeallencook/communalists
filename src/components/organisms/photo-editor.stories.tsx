import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    SAMPLE_LANDSCAPE,
    SAMPLE_LOGO,
    SAMPLE_PHOTO,
} from '@/components/molecules/photo-fixtures';

import { PhotoEditor } from './photo-editor';

const meta = {
    title: 'Components/Organisms/PhotoEditor',
    component: PhotoEditor,
    args: {
        kind: 'users',
        name: 'Maya Thompson',
        source: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        onCropChange: fn(),
        onZoomChange: fn(),
        onCropComplete: fn(),
        onPick: fn(),
        onCancel: fn(),
        onSave: fn(),
        onRemove: fn(),
    },
    parameters: {
        docs: {
            description: {
                component:
                    'Upload, crop and remove a profile photo (round) or logo (square). The crop dialog is keyboard friendly: focus the picture and use the arrow keys, and zoom with the slider or the − and + buttons. See Hooks/usePhotoUpload for it working end to end.',
            },
        },
    },
} satisfies Meta<typeof PhotoEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPhoto: Story = {};
export const WithPhoto: Story = { args: { photo: SAMPLE_PHOTO } };
export const Logo: Story = {
    args: {
        kind: 'organizations',
        name: 'South Bay Mutual Aid',
        photo: SAMPLE_LOGO,
    },
};
/** The dialog, after picking a wide picture: a round guide for people. */
export const Cropping: Story = { args: { source: SAMPLE_LANDSCAPE } };
/** Logos get a square guide. */
export const CroppingLogo: Story = {
    args: {
        kind: 'organizations',
        name: 'South Bay Mutual Aid',
        source: SAMPLE_LANDSCAPE,
        zoom: 1.6,
    },
};
export const Saving: Story = {
    args: { source: SAMPLE_LANDSCAPE, saving: true },
};
/** The server refused it (shown in the dialog, which stays open to retry). */
export const SaveFailed: Story = {
    args: { source: SAMPLE_LANDSCAPE, error: 'generic', at: 1 },
};
/** The picked file couldn't be opened (HEIC outside Safari, say). */
export const CouldNotOpen: Story = {
    args: { error: 'decodeFailed', at: 1 },
};
export const Saved: Story = {
    args: { photo: SAMPLE_PHOTO, done: 'uploaded', at: 1 },
};
export const Removing: Story = {
    args: { photo: SAMPLE_PHOTO, removing: true },
};
export const Removed: Story = { args: { done: 'removed', at: 1 } };
