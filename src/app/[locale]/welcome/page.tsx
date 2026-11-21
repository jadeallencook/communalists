import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    WelcomePage,
    WelcomePageLoading,
} from '@/components/pages/welcome-page';
import { requireAccount } from '@/lib/auth/require-account';

import { signOut } from './actions';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Welcome');
    return { title: t('metaTitle') };
}

// requireAccount sends signed-out visitors to sign-in and incomplete
// accounts to setup. Reading the session uses cookies, so it must stream behind <Suspense>
// (a build error otherwise with Cache Components).
export default function Page() {
    return (
        <Suspense fallback={<WelcomePageLoading />}>
            <WelcomeContainer />
        </Suspense>
    );
}

async function WelcomeContainer() {
    const { profile, locale } = await requireAccount('/welcome');
    return (
        <WelcomePage
            name={profile.displayName}
            areaLabel={profile.location.label}
            locale={locale}
            signOutAction={signOut}
        />
    );
}
