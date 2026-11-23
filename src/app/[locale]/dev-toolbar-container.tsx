'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import { DevToolbar } from '@/components/organisms/dev-toolbar';
import { useDevToolbarCorner } from '@/hooks/use-dev-toolbar-corner';
import type { TestAccount } from '@/lib/dev';

import {
    devSignIn,
    resetTestData,
    type ResetTestDataState,
} from '../actions/dev-tools';

/** Wires the dev toolbar. The layout renders it only when isLocalDev(). */
export function DevToolbarContainer({
    accounts,
}: {
    accounts: Pick<TestAccount, 'email' | 'summary' | 'featured'>[];
}) {
    const locale = useLocale();
    const [corner, setCorner] = useDevToolbarCorner();
    const [reset, resetAction, resetPending] = useActionState<
        ResetTestDataState,
        FormData
    >(() => resetTestData(), {});
    return (
        <DevToolbar
            accounts={accounts}
            locale={locale}
            signInAction={devSignIn}
            resetAction={resetAction}
            resetPending={resetPending}
            resetStatus={reset.status}
            corner={corner}
            onCornerChange={setCorner}
        />
    );
}
