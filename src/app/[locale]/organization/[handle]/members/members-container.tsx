'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useActionState } from 'react';

import {
    OrganizationMembersPage,
    type OrganizationMembersPageProps,
} from '@/components/pages/organization-members-page';

import { moderateAction, type MembershipActionState } from '../actions';

type Props = Omit<
    OrganizationMembersPageProps,
    'locale' | 'formAction' | 'pending' | 'error' | 'notice'
>;

/** Wires the members page to moderateAction and translates its result. */
export function MembersContainer(props: Props) {
    const locale = useLocale();
    const t = useTranslations('Membership');
    const [result, formAction, pending] = useActionState<
        MembershipActionState,
        FormData
    >(moderateAction, {});
    return (
        <OrganizationMembersPage
            {...props}
            locale={locale}
            formAction={formAction}
            pending={pending}
            error={result.error ? t(`errors.${result.error}`) : undefined}
            notice={result.done ? t(`done.${result.done}`) : undefined}
        />
    );
}
