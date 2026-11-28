'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { EndorsePanel } from '@/components/molecules/endorse-panel';
import type { EndorseState } from '@/lib/endorsements';

import { endorseAction, type EndorseActionState } from './endorse-action';

/** Wires EndorsePanel to endorseAction and translates its result. */
export function EndorsePanelContainer(props: {
    state: EndorseState;
    count: number;
    orgId: string;
    handle: string;
    loadFailed?: boolean;
}) {
    const locale = useLocale();
    const t = useTranslations('Endorsements');
    const [result, formAction, pending] = useActionState<
        EndorseActionState,
        FormData
    >(endorseAction, {});
    return (
        <EndorsePanel
            {...props}
            locale={locale}
            formAction={formAction}
            pending={pending}
            error={result.error ? t(`errors.${result.error}`) : undefined}
            notice={result.done ? t(`done.${result.done}`) : undefined}
        />
    );
}
