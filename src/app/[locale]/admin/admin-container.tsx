'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { AdminPage, type AdminPageProps } from '@/components/pages/admin-page';

import {
    decideClaimAction,
    restoreOrganizationAction,
    type DecideClaimState,
    type RestoreState,
} from './actions';

type Props = Omit<
    AdminPageProps,
    | 'locale'
    | 'formAction'
    | 'pending'
    | 'error'
    | 'notice'
    | 'resultKey'
    | 'restoreAction'
    | 'restorePending'
    | 'restoreError'
    | 'restoreNotice'
    | 'restoreKey'
>;

/** Wires the super-user page to decideClaimAction and translates its result. */
export function AdminContainer(props: Props) {
    const locale = useLocale();
    const t = useTranslations('Admin');
    const [result, formAction, pending] = useActionState<
        DecideClaimState,
        FormData
    >(decideClaimAction, {});
    const [restored, restoreAction, restorePending] = useActionState<
        RestoreState,
        FormData
    >(restoreOrganizationAction, {});
    return (
        <AdminPage
            {...props}
            locale={locale}
            formAction={formAction}
            pending={pending}
            error={result.error ? t(`errors.${result.error}`) : undefined}
            notice={result.done ? t(`done.${result.done}`) : undefined}
            resultKey={result.at}
            restoreAction={restoreAction}
            restorePending={restorePending}
            restoreError={
                restored.error
                    ? t(`restoreErrors.${restored.error}`)
                    : undefined
            }
            restoreNotice={restored.done ? t('restored') : undefined}
            restoreKey={restored.at}
        />
    );
}
