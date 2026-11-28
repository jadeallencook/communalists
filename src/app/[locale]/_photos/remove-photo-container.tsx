'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';

import { ReasonDialog } from '@/components/molecules/reason-dialog';
import { removePhotoAsModeratorAction } from '@/app/actions/photos';
import { REASON_MAX_LENGTH } from '@/lib/organizations/membership';
import type { PhotoKind } from '@/lib/photos';
import type { PhotoActionState } from '@/lib/validation/photo';

/**
 * A super user's "Remove photo" (or logo) with a required reason, logged
 * in adminLog (decision #71). Rendered for super users only; the action
 * checks again. It stays rendered after the photo is gone (`hasPhoto`
 * false), so the result is announced and focus moves to it instead of
 * being lost with the button.
 */
export function RemovePhotoContainer({
    kind,
    id,
    name,
    hasPhoto,
}: {
    kind: PhotoKind;
    /** The person's uid or the organization's id. */
    id: string;
    /** Whose photo, for the button's accessible name. */
    name: string;
    /** There's a photo this super user can see (shows the button). */
    hasPhoto: boolean;
}) {
    const t = useTranslations('Photo.moderation');
    const errors = useTranslations('Photo.errors');
    const [state, formAction, pending] = useActionState<
        PhotoActionState,
        FormData
    >(removePhotoAsModeratorAction, {});
    const doneRef = useRef<HTMLParagraphElement>(null);
    // The button is gone once the photo is: keep focus on the result.
    useEffect(() => {
        if (state.done) doneRef.current?.focus();
    }, [state.done, state.at]);
    if (!hasPhoto && !state.done && !state.error) return null;
    return (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
            {hasPhoto && (
                <ReasonDialog
                    triggerLabel={t('trigger', { kind })}
                    triggerAriaLabel={t('triggerFor', { kind, name })}
                    title={t('title', { kind })}
                    description={t('description')}
                    confirmLabel={t('confirm')}
                    fields={{ kind, id }}
                    formAction={formAction}
                    pending={pending}
                    maxLength={REASON_MAX_LENGTH}
                    reasonHint={t('reasonHint')}
                />
            )}
            <p
                ref={doneRef}
                role="status"
                tabIndex={-1}
                className="text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {state.done && (
                    <span key={state.at}>{t('done', { kind })}</span>
                )}
            </p>
            {state.error && (
                <p role="alert" className="text-sm text-destructive">
                    {errors(state.error)}
                </p>
            )}
        </div>
    );
}
