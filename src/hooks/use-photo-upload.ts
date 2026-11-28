'use client';

import {
    startTransition,
    useActionState,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    clampCrop,
    CROP_OUTPUT_SIZE,
    MAX_UPLOAD_BYTES,
    sourceProblem,
    type CropArea,
    type SourceProblem,
} from '@/lib/photos';
import type { PhotoActionState, PhotoErrorKey } from '@/lib/validation/photo';

type PhotoAction = (
    state: PhotoActionState,
    formData: FormData
) => Promise<PhotoActionState>;

/** Everything that can go wrong, as keys under Photo.errors. */
export type PhotoUploadError = PhotoErrorKey | SourceProblem | 'decodeFailed';

export interface UsePhotoUploadOptions {
    /** Server actions, passed in by the container. */
    uploadAction: PhotoAction;
    removeAction: PhotoAction;
    /** Extra form fields (an organization's id). */
    fields?: Record<string, string>;
}

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('decode'));
        image.src = src;
    });

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
    new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', quality)
    );

/**
 * Draws the chosen square to a 500×500 JPEG. A fresh canvas carries none of
 * the original's metadata (EXIF, location), and the original never leaves
 * the device. Transparent pictures get a white background.
 */
async function cropToJpeg(src: string, area: CropArea): Promise<Blob> {
    const image = await loadImage(src);
    const crop = clampCrop(area, {
        width: image.naturalWidth,
        height: image.naturalHeight,
    });
    const canvas = document.createElement('canvas');
    canvas.width = CROP_OUTPUT_SIZE;
    canvas.height = CROP_OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('canvas');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = 'high';
    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        canvas.width,
        canvas.height
    );
    for (const quality of [0.9, 0.75, 0.6]) {
        const blob = await toBlob(canvas, quality);
        if (blob && blob.size <= MAX_UPLOAD_BYTES) return blob;
    }
    throw new Error('tooLarge');
}

/**
 * Choosing, cropping and saving a profile photo or logo, and removing it.
 * Shared by every photo field; the container passes the server actions.
 * `source` is the picked picture while the crop dialog is open.
 */
export function usePhotoUpload({
    uploadAction,
    removeAction,
    fields = {},
}: UsePhotoUploadOptions) {
    const [source, setSource] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [localError, setLocalError] = useState<PhotoUploadError | null>(null);
    const [preparing, setPreparing] = useState(false);
    const area = useRef<CropArea | null>(null);

    const close = useCallback(() => {
        setSource((current) => {
            if (current) URL.revokeObjectURL(current);
            return null;
        });
        area.current = null;
    }, []);

    const [uploaded, upload, uploading] = useActionState<
        PhotoActionState,
        FormData
    >(async (previous, formData) => {
        const result = await uploadAction(previous, formData);
        // Saved: close the dialog. An error keeps it open to retry.
        if (result.done === 'uploaded') close();
        return result;
    }, {});
    const [removed, remove, removing] = useActionState(removeAction, {});

    // The latest result of either action is the one to report, until the
    // person starts something new (`seen` is the result they've moved past).
    const latest = (uploaded.at ?? 0) >= (removed.at ?? 0) ? uploaded : removed;
    const [seen, setSeen] = useState(0);
    const current = (latest.at ?? 0) > seen ? latest : {};
    const latestAt = latest.at ?? 0;
    const startOver = useCallback(() => {
        setLocalError(null);
        setSeen(latestAt);
    }, [latestAt]);

    // Don't keep the picture in memory after leaving the page.
    useEffect(() => close, [close]);

    const pick = useCallback(
        async (file: File) => {
            startOver();
            const problem = sourceProblem(file);
            if (problem) return setLocalError(problem);
            const url = URL.createObjectURL(file);
            try {
                // Formats the browser can't show (HEIC outside Safari) fail here.
                await loadImage(url);
            } catch {
                URL.revokeObjectURL(url);
                return setLocalError('decodeFailed');
            }
            setCrop({ x: 0, y: 0 });
            setZoom(1);
            setSource(url);
        },
        [startOver]
    );

    const save = useCallback(async () => {
        if (!source || !area.current) return;
        startOver();
        setPreparing(true);
        let blob: Blob;
        try {
            blob = await cropToJpeg(source, area.current);
        } catch (error) {
            setPreparing(false);
            return setLocalError(
                (error as Error).message === 'tooLarge'
                    ? 'tooLarge'
                    : 'decodeFailed'
            );
        }
        setPreparing(false);
        const formData = new FormData();
        for (const [name, value] of Object.entries(fields))
            formData.set(name, value);
        formData.set('photo', blob, 'photo.jpg');
        startTransition(() => upload(formData));
    }, [source, fields, upload, startOver]);

    const removePhoto = useCallback(() => {
        startOver();
        const formData = new FormData();
        for (const [name, value] of Object.entries(fields))
            formData.set(name, value);
        startTransition(() => remove(formData));
    }, [fields, remove, startOver]);

    return {
        source,
        crop,
        setCrop,
        zoom,
        setZoom,
        /** The cropper's latest area, in the picture's own pixels. */
        onCropComplete: (_: unknown, pixels: CropArea) => {
            area.current = pixels;
        },
        pick,
        cancel: () => {
            startOver();
            close();
        },
        save,
        remove: removePhoto,
        saving: preparing || uploading,
        removing,
        error: localError ?? current.error ?? null,
        done: localError ? undefined : current.done,
        /** Changes with every result, so the same message is announced again. */
        at: current.at,
    };
}
