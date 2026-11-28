import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SAMPLE_PHOTO } from '@/components/molecules/photo-fixtures';
import { PhotoEditor } from '@/components/organisms/photo-editor';
import type { PhotoActionState } from '@/lib/validation/photo';

import { usePhotoUpload } from './use-photo-upload';

/** Fake server actions: wait a moment, then answer. */
const answer =
    (result: PhotoActionState) => async (): Promise<PhotoActionState> => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return { ...result, at: Date.now() };
    };
const saves = answer({ done: 'uploaded' });
const fails = answer({ error: 'generic' });
const removes = answer({ done: 'removed' });

function Demo({
    failing,
    kind,
}: {
    failing: boolean;
    kind: 'users' | 'organizations';
}) {
    const upload = usePhotoUpload({
        uploadAction: failing ? fails : saves,
        removeAction: removes,
    });
    return (
        <PhotoEditor
            kind={kind}
            name="Maya Thompson"
            photo={upload.done === 'removed' ? undefined : SAMPLE_PHOTO}
            source={upload.source}
            crop={upload.crop}
            zoom={upload.zoom}
            onCropChange={upload.setCrop}
            onZoomChange={upload.setZoom}
            onCropComplete={upload.onCropComplete}
            onPick={upload.pick}
            onCancel={upload.cancel}
            onSave={upload.save}
            onRemove={upload.remove}
            saving={upload.saving}
            removing={upload.removing}
            error={upload.error}
            done={upload.done}
            at={upload.at}
        />
    );
}

const meta = {
    title: 'Hooks/usePhotoUpload',
    component: Demo,
    args: { failing: false, kind: 'users' },
    parameters: {
        docs: {
            description: {
                component:
                    'Pick a picture from your device, crop it, and save: the hook draws the square to a 500×500 JPEG in the browser (the original never leaves the device) and sends it to the upload action. These actions are fake; nothing is saved.',
            },
        },
    },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Works: Story = {};
export const Logo: Story = { args: { kind: 'organizations' } };
/** The server refuses the upload: the dialog stays open with the error. */
export const ServerFails: Story = { args: { failing: true } };
