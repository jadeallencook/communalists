'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState, useState } from 'react';

import { comradeAction, type ComradeActionState } from '@/app/actions/comrades';
import {
    ComradeButton,
    type ComradeButtonState,
} from '@/components/molecules/comrade-button';

/** Wires ComradeButton on a profile to comradeAction and translates its result. */
export function ComradeButtonContainer(props: {
    state: ComradeButtonState;
    uid: string;
    name: string;
    next: string;
    loadFailed?: boolean;
}) {
    const locale = useLocale();
    const t = useTranslations('Comrades');
    const [confirming, setConfirming] = useState(false);
    const [result, formAction, pending] = useActionState<
        ComradeActionState,
        FormData
    >(async (prev, formData) => {
        const next = await comradeAction(prev, formData);
        setConfirming(false);
        return next;
    }, {});
    return (
        <ComradeButton
            {...props}
            locale={locale}
            formAction={formAction}
            pending={pending}
            confirmingRemove={confirming}
            onConfirmingRemoveChange={setConfirming}
            focusKey={result.at}
            error={
                result.error
                    ? t(`errors.${result.error}`, { name: props.name })
                    : undefined
            }
            notice={result.done ? t(`done.${result.done}`) : undefined}
        />
    );
}
