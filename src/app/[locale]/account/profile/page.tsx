import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ProfileSettingsPageLoading } from '@/components/pages/profile-settings-page';
import { requireAccount } from '@/lib/auth/require-account';
import { getProfileGroups } from '@/lib/organizations';

import { ProfileSettingsContainer } from './profile-settings-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Profile');
    return { title: t('settingsTitle'), robots: { index: false } };
}

// Reads the session, so it streams behind <Suspense>.
export default function Page() {
    return (
        <Suspense fallback={<ProfileSettingsPageLoading />}>
            <ProfileSettingsServerContainer />
        </Suspense>
    );
}

async function ProfileSettingsServerContainer() {
    const { user, profile } = await requireAccount('/account/profile');
    const groups = await getProfileGroups(user.uid);
    return (
        <ProfileSettingsContainer
            name={profile.displayName}
            username={profile.username}
            areaLabel={profile.location.label}
            photo={profile.photo?.large}
            settings={profile.profile}
            groups={groups}
        />
    );
}
