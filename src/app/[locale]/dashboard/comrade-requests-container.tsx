'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { comradeAction, type ComradeActionState } from '@/app/actions/comrades';
import {
    ComradeRequestList,
    type ComradeRequestItem,
} from '@/components/molecules/comrade-request-list';

/** Wires the dashboard's "Comrade requests" to comradeAction. */
export function ComradeRequestsContainer({
    requests,
}: {
    /** Null if they couldn't be loaded. */
    requests: ComradeRequestItem[] | null;
}) {
    const locale = useLocale();
    const t = useTranslations('Comrades');
    const [result, formAction, pending] = useActionState<
        ComradeActionState,
        FormData
    >(comradeAction, {});
    const name = requests?.find((r) => r.uid === result.uid)?.name ?? '';
    return (
        <ComradeRequestList
            requests={requests}
            next="/dashboard"
            locale={locale}
            formAction={formAction}
            pending={pending}
            from="dashboard"
            focusKey={result.at}
            notice={result.done ? t(`done.${result.done}`) : undefined}
            error={
                result.error ? t(`errors.${result.error}`, { name }) : undefined
            }
        />
    );
}
