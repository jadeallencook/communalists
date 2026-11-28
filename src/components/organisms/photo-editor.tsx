'use client';

import { ImageUpIcon, MinusIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import { Button } from '@/components/atoms/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Avatar } from '@/components/molecules/avatar';
import type { PhotoUploadError } from '@/hooks/use-photo-upload';
import { track } from '@/lib/analytics';
import type { PhotoKind } from '@/lib/photos';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export interface PhotoEditorProps {
    /** A person's profile photo (round) or an organization's logo (square). */
    kind: PhotoKind;
    /** Whose it is: initials when there's no photo. */
    name: string;
    /** The current photo's large link. */
    photo?: string;
    /** The picked picture, while cropping (opens the dialog). */
    source: string | null;
    crop: Point;
    zoom: number;
    onCropChange: (crop: Point) => void;
    onZoomChange: (zoom: number) => void;
    onCropComplete: (area: Area, pixels: Area) => void;
    onPick: (file: File) => void;
    onCancel: () => void;
    onSave: () => void;
    onRemove: () => void;
    saving?: boolean;
    removing?: boolean;
    error?: PhotoUploadError | null;
    done?: 'uploaded' | 'removed';
    /** Changes with each result, so a repeated message is announced again. */
    at?: number;
}

/**
 * Upload, crop and remove a profile photo or logo. Picking a picture opens
 * a dialog to choose the square: drag it, or focus it and use the arrow
 * keys (Shift for small steps); zoom with the slider or the − and + buttons.
 * Results are announced; focus returns to the upload button.
 */
export function PhotoEditor({
    kind,
    name,
    photo,
    source,
    crop,
    zoom,
    onCropChange,
    onZoomChange,
    onCropComplete,
    onPick,
    onCancel,
    onSave,
    onRemove,
    saving = false,
    removing = false,
    error = null,
    done,
    at,
}: PhotoEditorProps) {
    const t = useTranslations('Photo');
    const inputRef = useRef<HTMLInputElement>(null);
    const uploadRef = useRef<HTMLButtonElement>(null);
    const id = useId();
    const round = kind === 'users';
    const busy = saving || removing;
    const open = source !== null;

    // Removing hides the Remove button: keep focus on the field.
    useEffect(() => {
        if (done === 'removed') uploadRef.current?.focus();
    }, [done, at]);

    const clampZoom = (value: number) =>
        Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 10) / 10));

    return (
        <section
            aria-labelledby={`${id}-title`}
            className="flex flex-col gap-3"
        >
            <div className="flex flex-col gap-1">
                <h2
                    id={`${id}-title`}
                    className="font-heading text-lg font-semibold"
                >
                    {t('title', { kind })}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {t('hint', { kind })}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
                <Avatar
                    name={name}
                    photo={photo}
                    shape={round ? 'round' : 'square'}
                    size={96}
                />
                <div className="flex flex-wrap gap-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            // Let the same file be picked again later.
                            event.target.value = '';
                            if (file) onPick(file);
                        }}
                    />
                    <Button
                        ref={uploadRef}
                        type="button"
                        variant="outline"
                        // aria-disabled, not disabled: a disabled button
                        // drops keyboard focus (accessibility.md).
                        onClick={() => !busy && inputRef.current?.click()}
                        aria-disabled={busy}
                    >
                        <ImageUpIcon aria-hidden />
                        {photo ? t('change', { kind }) : t('upload', { kind })}
                    </Button>
                    {photo && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => !busy && onRemove()}
                            aria-disabled={busy}
                            {...track('photo-remove', { kind })}
                        >
                            <Trash2Icon aria-hidden />
                            {removing ? t('removing') : t('remove', { kind })}
                        </Button>
                    )}
                </div>
            </div>
            <p className="text-sm text-muted-foreground">{t('formats')}</p>
            {/* Outside the dialog: results after it closes, and problems
                with the picked file (it never opened). */}
            <div aria-live="polite" role="status" className="text-sm">
                {!open && done && (
                    <span key={at}>{t(`done.${done}`, { kind })}</span>
                )}
            </div>
            {!open && error && (
                <p role="alert" className="text-sm text-destructive">
                    {t(`errors.${error}`)}
                </p>
            )}

            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (!next && !saving) onCancel();
                }}
            >
                <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-md"
                    onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        uploadRef.current?.focus();
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>{t('crop.title', { kind })}</DialogTitle>
                        <DialogDescription id={`${id}-how`}>
                            {t('crop.description')}
                        </DialogDescription>
                    </DialogHeader>
                    {source && (
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
                            <Cropper
                                image={source}
                                crop={crop}
                                zoom={zoom}
                                minZoom={MIN_ZOOM}
                                maxZoom={MAX_ZOOM}
                                aspect={1}
                                cropShape={round ? 'round' : 'rect'}
                                showGrid={false}
                                objectFit="cover"
                                onCropChange={onCropChange}
                                onZoomChange={(value) =>
                                    onZoomChange(clampZoom(value))
                                }
                                onCropComplete={onCropComplete}
                                classes={{
                                    cropAreaClassName:
                                        'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring',
                                }}
                                cropperProps={{
                                    role: 'group',
                                    'aria-label': t('crop.area'),
                                    'aria-describedby': `${id}-how`,
                                }}
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-lg"
                            aria-label={t('crop.zoomOut')}
                            disabled={zoom <= MIN_ZOOM}
                            onClick={() =>
                                onZoomChange(clampZoom(zoom - ZOOM_STEP * 2))
                            }
                        >
                            <MinusIcon aria-hidden />
                        </Button>
                        <label htmlFor={`${id}-zoom`} className="sr-only">
                            {t('crop.zoom')}
                        </label>
                        <input
                            id={`${id}-zoom`}
                            type="range"
                            min={MIN_ZOOM}
                            max={MAX_ZOOM}
                            step={ZOOM_STEP}
                            value={zoom}
                            aria-valuetext={t('crop.zoomValue', {
                                percent: Math.round(zoom * 100),
                            })}
                            onChange={(event) =>
                                onZoomChange(
                                    clampZoom(Number(event.target.value))
                                )
                            }
                            className="h-2 flex-1 cursor-pointer accent-primary"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-lg"
                            aria-label={t('crop.zoomIn')}
                            disabled={zoom >= MAX_ZOOM}
                            onClick={() =>
                                onZoomChange(clampZoom(zoom + ZOOM_STEP * 2))
                            }
                        >
                            <PlusIcon aria-hidden />
                        </Button>
                    </div>
                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {t(`errors.${error}`)}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => !saving && onCancel()}
                            aria-disabled={saving}
                        >
                            {t('crop.cancel')}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => !saving && onSave()}
                            aria-disabled={saving}
                            {...track('photo-save', { kind })}
                        >
                            {saving ? t('crop.saving') : t('crop.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
