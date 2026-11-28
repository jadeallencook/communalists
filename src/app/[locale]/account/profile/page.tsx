import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ProfileSettingsPageLoading } from '@/components/pages/profile-settings-page';
import { requireAccount } from '@/lib/auth/require-account';
import { getProfileComrades } from '@/lib/comrades/store';
import { getProfileEndorsements } from '@/lib/endorsements/store';
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
    const [groups, endorsements, comrades] = await Promise.all([
        getProfileGroups(user.uid),
        // Only listed here; saving doesn't need them, so a failed read
        // shows its own message and the form still works.
        getProfileEndorsements(user.uid).catch((error: Error) => {
            console.error('[endorsements] settings read failed', error.message);
            return null;
        }),
        // Only for the preview: without them it lists no comrades.
        getProfileComrades(user.uid).catch((error: Error) => {
            console.error('[comrades] settings read failed', error.message);
            return [];
        }),
    ]);
    return (
        <ProfileSettingsContainer
            name={profile.displayName}
            username={profile.username}
            areaLabel={profile.location.label}
            photo={profile.photo?.large}
            settings={profile.profile}
            groups={groups}
            endorsements={endorsements}
            comrades={comrades}
        />
    );
}
