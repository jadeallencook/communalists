'use client';

import { PhotoEditor } from '@/components/organisms/photo-editor';
import {
    removeOrganizationPhotoAction,
    removeProfilePhotoAction,
    uploadOrganizationPhotoAction,
    uploadProfilePhotoAction,
} from '@/app/actions/photos';
import { usePhotoUpload } from '@/hooks/use-photo-upload';

/**
 * Wires a PhotoEditor to the photo actions: your own profile photo, or
 * (with `orgId`) an organization's logo. The server checks who may change
 * it; this only picks the actions.
 */
export function PhotoEditorContainer({
    name,
    photo,
    orgId,
}: {
    name: string;
    /** The current photo's large link. */
    photo?: string;
    /** An organization's logo; leave out for your own profile photo. */
    orgId?: string;
}) {
    const upload = usePhotoUpload(
        orgId
            ? {
                  uploadAction: uploadOrganizationPhotoAction,
                  removeAction: removeOrganizationPhotoAction,
                  fields: { orgId },
              }
            : {
                  uploadAction: uploadProfilePhotoAction,
                  removeAction: removeProfilePhotoAction,
              }
    );
    return (
        <PhotoEditor
            kind={orgId ? 'organizations' : 'users'}
            name={name}
            photo={photo}
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
