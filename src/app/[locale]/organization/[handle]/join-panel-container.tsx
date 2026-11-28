'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { JoinPanel } from '@/components/organisms/join-panel';
import type { JoinState } from '@/lib/organizations/membership';

import { membershipAction, type MembershipActionState } from './actions';

/** Wires JoinPanel to membershipAction and translates its result. */
export function JoinPanelContainer(props: {
    state: JoinState;
    orgId: string;
    handle: string;
    name: string;
}) {
    const locale = useLocale();
    const t = useTranslations('Membership');
    const [result, formAction, pending] = useActionState<
        MembershipActionState,
        FormData
    >(membershipAction, {});
    return (
        <JoinPanel
            {...props}
            locale={locale}
            formAction={formAction}
            pending={pending}
            error={result.error ? t(`errors.${result.error}`) : undefined}
            notice={result.done ? t(`done.${result.done}`) : undefined}
        />
    );
}
