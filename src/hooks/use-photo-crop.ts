'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import {
    centeredCrop,
    cropSourceRect,
    MAX_PHOTO_UPLOAD_BYTES,
    moveCrop,
    PHOTO_UPLOAD_SIZE,
    photoDimensionsProblem,
    photoFileProblem,
    zoomCrop,
    type CropFrame,
    type PhotoCrop,
    type PhotoPickProblem,
} from '@/lib/photos';

/** The crop area's size in CSS pixels. */
export const PHOTO_CROP_VIEWPORT = 224;
/** How far one press of a move button moves the photo, in CSS pixels. */
const STEP = 16;

export type MoveDirection = 'up' | 'down' | 'left' | 'right';

export interface PhotoCropState {
    /** The picked photo, as an object URL, once it has loaded. */
    src: string | null;
    frame: CropFrame | null;
    crop: PhotoCrop | null;
    problem: PhotoPickProblem | null;
    /** Checks the file, loads it and centers it. */
    pick: (file: File | undefined) => Promise<void>;
    /** Forgets the picked photo (the dialog closed). */
    reset: () => void;
    setZoom: (zoom: number) => void;
    move: (direction: MoveDirection) => void;
    /** Spread onto the crop area for dragging with a mouse, pen or finger. */
    dragHandlers: {
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
        onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
        onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
        onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
    };
    /** The cropped square, ready to upload; null if nothing is picked. */
    toFile: () => Promise<File | null>;
}

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
    new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality)
    );

/**
 * The photo editor's crop logic: pick a file, move and zoom it inside a
 * square, and export that square at PHOTO_UPLOAD_SIZE. The original never
 * leaves the device; only the cropped square is uploaded, and the server
 * checks and shrinks it again (src/lib/photo-store.ts).
 */
export function usePhotoCrop(): PhotoCropState {
    const [src, setSrc] = useState<string | null>(null);
    const [frame, setFrame] = useState<CropFrame | null>(null);
    const [crop, setCrop] = useState<PhotoCrop | null>(null);
    const [problem, setProblem] = useState<PhotoPickProblem | null>(null);
    const image = useRef<HTMLImageElement | null>(null);
    const drag = useRef<{ id: number; x: number; y: number } | null>(null);

    // Free the object URL when it's replaced or the editor goes away.
    useEffect(() => {
        if (!src) return;
        return () => URL.revokeObjectURL(src);
    }, [src]);

    const reset = useCallback(() => {
        setSrc(null);
        setFrame(null);
        setCrop(null);
        setProblem(null);
        image.current = null;
    }, []);

    const pick = useCallback(async (file: File | undefined) => {
        if (!file) return;
        const fileProblem = photoFileProblem(file);
        if (fileProblem) {
            setProblem(fileProblem);
            return;
        }
        const url = URL.createObjectURL(file);
        try {
            const loaded = await loadImage(url);
            const sizeProblem = photoDimensionsProblem(
                loaded.naturalWidth,
                loaded.naturalHeight
            );
            if (sizeProblem) {
                URL.revokeObjectURL(url);
                setProblem(sizeProblem);
                return;
            }
            const next = {
                width: loaded.naturalWidth,
                height: loaded.naturalHeight,
                viewport: PHOTO_CROP_VIEWPORT,
            };
            image.current = loaded;
            setProblem(null);
            setFrame(next);
            setCrop(centeredCrop(next));
            setSrc(url);
        } catch {
            URL.revokeObjectURL(url);
            setProblem('unreadable');
        }
    }, []);

    const setZoom = useCallback(
        (zoom: number) => {
            if (frame && crop) setCrop(zoomCrop(frame, crop, zoom));
        },
        [frame, crop]
    );

    const move = useCallback(
        (direction: MoveDirection) => {
            if (!frame || !crop) return;
            // "Move up" shows more of what's above: the photo slides down.
            const [dx, dy] = {
                up: [0, STEP],
                down: [0, -STEP],
                left: [STEP, 0],
                right: [-STEP, 0],
            }[direction];
            setCrop(moveCrop(frame, crop, dx, dy));
        },
        [frame, crop]
    );

    const dragHandlers: PhotoCropState['dragHandlers'] = {
        onPointerDown: (event) => {
            if (!crop) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
            };
        },
        onPointerMove: (event) => {
            const start = drag.current;
            if (!start || start.id !== event.pointerId || !frame || !crop)
                return;
            setCrop(
                moveCrop(
                    frame,
                    crop,
                    event.clientX - start.x,
                    event.clientY - start.y
                )
            );
            drag.current = { ...start, x: event.clientX, y: event.clientY };
        },
        onPointerUp: () => {
            drag.current = null;
        },
        onPointerCancel: () => {
            drag.current = null;
        },
    };

    const toFile = useCallback(async () => {
        if (!image.current || !frame || !crop) return null;
        const canvas = document.createElement('canvas');
        canvas.width = PHOTO_UPLOAD_SIZE;
        canvas.height = PHOTO_UPLOAD_SIZE;
        const context = canvas.getContext('2d');
        if (!context) return null;
        context.imageSmoothingQuality = 'high';
        const { sx, sy, size } = cropSourceRect(frame, crop);
        context.drawImage(
            image.current,
            sx,
            sy,
            size,
            size,
            0,
            0,
            PHOTO_UPLOAD_SIZE,
            PHOTO_UPLOAD_SIZE
        );
        // WebP keeps transparent logos transparent; browsers that can't
        // write it give PNG. If that's too big, JPEG on white always fits.
        let blob = await toBlob(canvas, 'image/webp', 0.9);
        if (!blob || blob.size > MAX_PHOTO_UPLOAD_BYTES) {
            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = '#fff';
            context.fillRect(0, 0, PHOTO_UPLOAD_SIZE, PHOTO_UPLOAD_SIZE);
            blob = await toBlob(canvas, 'image/jpeg', 0.85);
        }
        if (!blob) return null;
        const extension = blob.type.split('/')[1] ?? 'png';
        return new File([blob], `photo.${extension}`, { type: blob.type });
    }, [frame, crop]);

    return {
        src,
        frame,
        crop,
        problem,
        pick,
        reset,
        setZoom,
        move,
        dragHandlers,
        toFile,
    };
}
