'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { AdminPage, type AdminPageProps } from '@/components/pages/admin-page';

import {
    backfillMissingDetailsAction,
    decideClaimAction,
    restoreOrganizationAction,
    type BackfillState,
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
    | 'organizations'
> & {
    organizations: Omit<AdminPageProps['organizations'], 'backfill'>;
    /** Whether the missing-details backfill still needs to run. */
    backfillNeeded: boolean;
};

/** Wires the super-user page to its actions and translates their results. */
export function AdminContainer({
    organizations,
    backfillNeeded,
    ...props
}: Props) {
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
    const [backfilled, backfillAction, backfillPending] = useActionState<
        BackfillState,
        FormData
    >(backfillMissingDetailsAction, {});
    return (
        <AdminPage
            {...props}
            organizations={{
                ...organizations,
                // Keep the result showing after the form disappears.
                backfill:
                    backfillNeeded || backfilled.at
                        ? {
                              needed: backfillNeeded && !backfilled.done,
                              action: backfillAction,
                              pending: backfillPending,
                              notice: backfilled.done
                                  ? t('backfill.done', backfilled.done)
                                  : undefined,
                              error: backfilled.error
                                  ? t('backfill.error')
                                  : undefined,
                              resultKey: backfilled.at,
                          }
                        : undefined,
            }}
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
