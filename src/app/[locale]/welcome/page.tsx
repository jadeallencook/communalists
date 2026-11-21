import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    WelcomePage,
    WelcomePageLoading,
} from '@/components/pages/welcome-page';
import { redirect } from '@/i18n/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { getUserProfile } from '@/lib/users';

import { signOut } from './actions';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Welcome');
    return { title: t('metaTitle') };
}

// Reading the session uses cookies, so it must stream behind <Suspense>
// (a build error otherwise with Cache Components).
export default function Page() {
    return (
        <Suspense fallback={<WelcomePageLoading />}>
            <WelcomeContainer />
        </Suspense>
    );
}

async function WelcomeContainer() {
    const [locale, user] = await Promise.all([getLocale(), getSessionUser()]);
    if (!user) return redirect({ href: '/sign-up', locale });

    const profile = await getUserProfile(user.uid);
    return (
        <WelcomePage
            name={profile?.displayName ?? user.name ?? ''}
            areaLabel={profile?.location.label}
            locale={locale}
            signOutAction={signOut}
        />
    );
}
