import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    AccountSetupPage,
    AccountSetupPageLoading,
} from '@/components/pages/account-setup-page';
import { isSetupComplete, safeNextPath } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import { isSupportedCountry } from '@/lib/places/types';
import { getUserProfileFresh } from '@/lib/users';
import { redirect } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

import { AccountSetupFormContainer } from './account-setup-form-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AccountSetup');
    return { title: t('metaTitle'), robots: { index: false } };
}

// Reads the session and search params, so it streams behind <Suspense>.
export default function Page({
    searchParams,
}: PageProps<'/[locale]/account/setup'>) {
    return (
        <Suspense fallback={<AccountSetupPageLoading />}>
            <AccountSetupContainer searchParams={searchParams} />
        </Suspense>
    );
}

async function AccountSetupContainer({
    searchParams,
}: Pick<PageProps<'/[locale]/account/setup'>, 'searchParams'>) {
    const [locale, user, params] = await Promise.all([
        getLocale(),
        getSessionUser(),
        searchParams,
    ]);
    const next = safeNextPath(params.next, routing.locales);
    if (!user) return redirect({ href: '/sign-in', locale });

    // Fresh, not cached: this decides whether setup is still needed.
    const profile = await getUserProfileFresh(user.uid);
    // Nothing to ask: carry on. (Editing a profile will be its own page.)
    if (isSetupComplete(profile)) return redirect({ href: next, locale });

    const location = profile?.location;
    return (
        <AccountSetupPage
            // Only changes the wording, so a hand-edited URL does no harm.
            variant={params.from === 'sign-up' ? 'new' : 'returning'}
            form={
                <AccountSetupFormContainer
                    next={next}
                    // Prototype accounts may have a name on the Auth user.
                    name={profile?.displayName ?? user.name ?? undefined}
                    preferredLocale={profile?.locale}
                    country={
                        location && isSupportedCountry(location.country)
                            ? location.country
                            : undefined
                    }
                    place={
                        location
                            ? { id: location.placeId, label: location.label }
                            : null
                    }
                />
            }
        />
    );
}
