import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import {
    sampleOrgPhoto,
    samplePersonPhoto,
} from '@/components/molecules/photo-fixtures';
import type { PhotoSaveResult } from '@/lib/photos';

import { PhotoEditor } from './photo-editor';

const saved = async (): Promise<PhotoSaveResult> => ({
    ok: true,
    removed: false,
});

const meta = {
    title: 'Components/Organisms/Photo Editor',
    component: PhotoEditor,
    args: {
        name: 'Maya Thompson',
        audience: 'profile',
        saveAction: fn(saved),
    },
    decorators: [
        (Story) => (
            <div className="p-6">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof PhotoEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover the photo (or Tab to it) to see the edit button. Always shown on touch screens. */
export const Overlay: Story = { args: { photoUrl: samplePersonPhoto } };
export const OverlayNoPhoto: Story = {};
export const Organization: Story = {
    args: {
        name: 'South Bay Mutual Aid',
        audience: 'org',
        shape: 'rounded',
        photoUrl: sampleOrgPhoto,
    },
};
/** On edit pages: the photo with a visible "Change photo" button. */
export const Field: Story = {
    args: { variant: 'field', photoUrl: samplePersonPhoto },
};
export const FieldNoPhoto: Story = { args: { variant: 'field' } };
/** The dialog before a file is chosen: Remove is offered when there's a photo. */
export const DialogOpen: Story = {
    args: { photoUrl: samplePersonPhoto, defaultOpen: true },
};
/** Saving fails: the error is announced and the dialog stays open. */
export const SaveFails: Story = {
    args: {
        photoUrl: samplePersonPhoto,
        defaultOpen: true,
        saveAction: fn(async (): Promise<PhotoSaveResult> => ({
            ok: false,
            error: 'generic',
        })),
    },
};
/** A long name in the button's label and the dialog title. */
export const LongOrganizationName: Story = {
    args: {
        name: 'East San José Community Fridge & Free Store Collective',
        audience: 'org',
        shape: 'rounded',
        defaultOpen: true,
    },
};
