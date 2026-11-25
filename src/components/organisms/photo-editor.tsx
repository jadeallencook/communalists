'use client';

import {
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    ImageIcon,
    PencilIcon,
    Trash2Icon,
} from 'lucide-react';
import { cn } from 'cn';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/atoms/dialog';
import { Avatar, type AvatarSize } from '@/components/molecules/avatar';
import {
    PHOTO_CROP_VIEWPORT,
    usePhotoCrop,
    type MoveDirection,
} from '@/hooks/use-photo-crop';
import {
    cropScale,
    MAX_PHOTO_ZOOM,
    PHOTO_FIELD,
    PHOTO_PICK_TYPES,
    type PhotoPickProblem,
    type PhotoSaveError,
    type PhotoSaveResult,
} from '@/lib/photos';

export interface PhotoEditorProps {
    /** Whose photo: initials when there's none, and the button's label. */
    name: string;
    photoUrl?: string;
    /** People are circles; organizations are rounded squares. */
    shape?: 'circle' | 'rounded';
    /** Which explanation the dialog gives. */
    audience: 'org' | 'profile';
    /**
     * `overlay`: the photo with a small edit button on its corner, shown on
     * hover and keyboard focus (always on touch screens). `field`: the photo
     * with visible "Change photo" text, for edit forms.
     */
    variant?: 'overlay' | 'field';
    size?: AvatarSize;
    /** In the app, a server action (saveOrganizationPhotoAction, saveProfilePhotoAction). */
    saveAction: (formData: FormData) => Promise<PhotoSaveResult>;
    /** Sent with the photo, e.g. { orgId }. */
    fields?: Record<string, string>;
    /** Opens the dialog on first render (Storybook). */
    defaultOpen?: boolean;
}

type ErrorKey = PhotoPickProblem | PhotoSaveError;

const MOVES: { direction: MoveDirection; icon: typeof ArrowUpIcon }[] = [
    { direction: 'left', icon: ArrowLeftIcon },
    { direction: 'up', icon: ArrowUpIcon },
    { direction: 'down', icon: ArrowDownIcon },
    { direction: 'right', icon: ArrowRightIcon },
];
const moveKey = {
    up: 'moveUp',
    down: 'moveDown',
    left: 'moveLeft',
    right: 'moveRight',
} as const;

/**
 * A photo people are allowed to change, and the dialog that changes it:
 * choose a file, drag (or use the arrow buttons) and zoom to fit it in the
 * shape, then save. Removing goes back to initials.
 */
export function PhotoEditor({
    name,
    photoUrl,
    shape = 'circle',
    audience,
    variant = 'overlay',
    size = 'lg',
    saveAction,
    fields = {},
    defaultOpen = false,
}: PhotoEditorProps) {
    const t = useTranslations('Photo');
    const [open, setOpen] = useState(defaultOpen);
    const [error, setError] = useState<ErrorKey | null>(null);
    const [status, setStatus] = useState('');
    const [pending, startTransition] = useTransition();
    const [removing, setRemoving] = useState(false);
    const crop = usePhotoCrop();
    const fileInput = useRef<HTMLInputElement>(null);
    const zoomId = useId();
    const errorId = useId();
    const shown = crop.problem ?? error;

    const onOpenChange = (next: boolean) => {
        if (pending) return;
        setOpen(next);
        if (next) setStatus('');
        else {
            crop.reset();
            setError(null);
        }
    };

    const send = (formData: FormData, remove: boolean) => {
        for (const [key, value] of Object.entries(fields))
            formData.set(key, value);
        setRemoving(remove);
        startTransition(async () => {
            const result = await saveAction(formData);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            setStatus(t(result.removed ? 'removed' : 'saved'));
            setOpen(false);
            crop.reset();
            setError(null);
        });
    };

    const save = async () => {
        setError(null);
        const file = await crop.toFile();
        if (!file) {
            setError('unreadable');
            return;
        }
        const formData = new FormData();
        formData.set(PHOTO_FIELD, file);
        send(formData, false);
    };

    const remove = () => {
        setError(null);
        const formData = new FormData();
        formData.set('remove', '1');
        send(formData, true);
    };

    const editButton = (
        <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(true)}
            aria-label={t('changeFor', { name })}
            className={cn(
                'absolute -right-1.5 -bottom-1.5 size-7 rounded-full p-0 shadow-sm',
                // Appears on hover or keyboard focus; always there on touch
                // screens, which can't hover.
                'opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100'
            )}
        >
            <PencilIcon aria-hidden className="size-3.5" />
        </Button>
    );

    return (
        <>
            {variant === 'overlay' ? (
                <span className="group relative inline-flex shrink-0">
                    <Avatar
                        name={name}
                        photoUrl={photoUrl}
                        shape={shape}
                        size={size}
                    />
                    {editButton}
                    <span role="status" className="sr-only">
                        {status}
                    </span>
                </span>
            ) : (
                <div className="flex items-center gap-4">
                    <Avatar
                        name={name}
                        photoUrl={photoUrl}
                        shape={shape}
                        size={size}
                    />
                    <div className="flex flex-col items-start gap-1.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(true)}
                        >
                            <ImageIcon aria-hidden />
                            {t('change')}
                        </Button>
                        <p
                            role="status"
                            className="text-sm text-muted-foreground"
                        >
                            {status || (!photoUrl && t('none'))}
                        </p>
                    </div>
                </div>
            )}

            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {audience === 'org'
                                ? t('titleOrg', { name })
                                : t('titleProfile')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                audience === 'org'
                                    ? 'descriptionOrg'
                                    : 'descriptionProfile'
                            )}{' '}
                            {crop.src && t('description')}
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        ref={fileInput}
                        type="file"
                        accept={PHOTO_PICK_TYPES.join(',')}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden
                        onChange={(event) => {
                            setError(null);
                            void crop.pick(event.target.files?.[0]);
                            event.target.value = ''; // the same file can be picked again
                        }}
                    />

                    {crop.src && crop.frame && crop.crop ? (
                        <Cropper
                            src={crop.src}
                            frame={crop.frame}
                            crop={crop.crop}
                            shape={shape}
                            dragHandlers={crop.dragHandlers}
                            onMove={crop.move}
                            onZoom={crop.setZoom}
                            zoomId={zoomId}
                            onChooseAnother={() => fileInput.current?.click()}
                            disabled={pending}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-2">
                            <Avatar
                                name={name}
                                photoUrl={photoUrl}
                                shape={shape}
                                className={cn(
                                    'size-28 text-3xl',
                                    shape === 'rounded' && 'rounded-2xl'
                                )}
                            />
                            <Button
                                type="button"
                                onClick={() => fileInput.current?.click()}
                                disabled={pending}
                                aria-describedby={shown ? errorId : undefined}
                            >
                                <ImageIcon aria-hidden />
                                {t('choose')}
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                {t('types')}
                            </p>
                        </div>
                    )}

                    {shown && (
                        <p
                            id={errorId}
                            role="alert"
                            className="text-sm text-destructive"
                        >
                            {t(`errors.${shown}`)}
                        </p>
                    )}

                    <DialogFooter>
                        {photoUrl && !crop.src && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={remove}
                                disabled={pending}
                                className="sm:mr-auto"
                            >
                                <Trash2Icon aria-hidden />
                                {pending && removing
                                    ? t('removing')
                                    : t('remove')}
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={pending}
                            >
                                {t('cancel')}
                            </Button>
                        </DialogClose>
                        {crop.src && (
                            <Button
                                type="button"
                                onClick={save}
                                disabled={pending}
                            >
                                {pending && !removing ? t('saving') : t('save')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

/** The crop area, a small preview at real size, move buttons and zoom. */
function Cropper({
    src,
    frame,
    crop,
    shape,
    dragHandlers,
    onMove,
    onZoom,
    zoomId,
    onChooseAnother,
    disabled,
}: {
    src: string;
    frame: NonNullable<ReturnType<typeof usePhotoCrop>['frame']>;
    crop: NonNullable<ReturnType<typeof usePhotoCrop>['crop']>;
    shape: 'circle' | 'rounded';
    dragHandlers: ReturnType<typeof usePhotoCrop>['dragHandlers'];
    onMove: (direction: MoveDirection) => void;
    onZoom: (zoom: number) => void;
    zoomId: string;
    onChooseAnother: () => void;
    disabled: boolean;
}) {
    const t = useTranslations('Photo');
    const scale = cropScale(frame, crop.zoom);
    const photo = (
        // The picked file, shown locally (an object URL); never uploaded as is.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt=""
            draggable={false}
            className="absolute top-0 left-0 max-w-none origin-top-left select-none"
            style={{
                width: frame.width * scale,
                height: frame.height * scale,
                transform: `translate(${crop.x}px, ${crop.y}px)`,
            }}
        />
    );
    const mask = shape === 'circle' ? 'rounded-full' : 'rounded-[18%]';
    // The preview shows the same crop at the size pages use (64 px).
    const previewScale = 64 / PHOTO_CROP_VIEWPORT;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-end gap-4">
                <div
                    {...dragHandlers}
                    className="relative cursor-grab touch-none overflow-hidden rounded-lg bg-muted active:cursor-grabbing"
                    style={{
                        width: PHOTO_CROP_VIEWPORT,
                        height: PHOTO_CROP_VIEWPORT,
                    }}
                >
                    {photo}
                    {/* Dims what's outside the shape. */}
                    <span
                        aria-hidden
                        className={cn(
                            'pointer-events-none absolute inset-0 shadow-[0_0_0_9999px_rgb(0_0_0/0.55)] ring-2 ring-white/90',
                            mask
                        )}
                    />
                </div>
                <div
                    aria-hidden
                    className={cn(
                        'relative size-16 shrink-0 overflow-hidden bg-muted',
                        shape === 'circle' ? 'rounded-full' : 'rounded-xl'
                    )}
                >
                    <div
                        className="absolute top-0 left-0 origin-top-left"
                        style={{
                            width: PHOTO_CROP_VIEWPORT,
                            height: PHOTO_CROP_VIEWPORT,
                            transform: `scale(${previewScale})`,
                        }}
                    >
                        {photo}
                    </div>
                </div>
            </div>

            <div
                role="group"
                aria-label={t('position')}
                className="flex gap-1.5"
            >
                {MOVES.map(({ direction, icon: Icon }) => (
                    <Button
                        key={direction}
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => onMove(direction)}
                        disabled={disabled}
                        aria-label={t(moveKey[direction])}
                    >
                        <Icon aria-hidden />
                    </Button>
                ))}
            </div>

            <div className="flex w-full max-w-xs flex-col gap-1.5">
                <label htmlFor={zoomId} className="text-sm font-medium">
                    {t('zoom')}
                </label>
                <input
                    id={zoomId}
                    type="range"
                    min={1}
                    max={MAX_PHOTO_ZOOM}
                    step={0.05}
                    value={crop.zoom}
                    onChange={(event) => onZoom(Number(event.target.value))}
                    aria-valuetext={`${Math.round(crop.zoom * 100)}%`}
                    disabled={disabled}
                    className="w-full accent-primary"
                />
            </div>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onChooseAnother}
                disabled={disabled}
            >
                <ImageIcon aria-hidden />
                {t('chooseAnother')}
            </Button>
        </div>
    );
}
