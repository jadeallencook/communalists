import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    ProfilePage,
    ProfilePageLoading,
} from '@/components/pages/profile-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import { getMemberships, getProfileGroups } from '@/lib/organizations';
import { handleProblem } from '@/lib/organizations/handle';
import { profilePath } from '@/lib/paths';
import { profileSummary, profileView, profileViewer } from '@/lib/profiles';
import { snippet } from '@/lib/seo';
import { shareCardPath, shareCardVersion } from '@/lib/share-cards';
import { getUidByUsername, getUserProfile } from '@/lib/users';
import { redirect } from '@/i18n/navigation';

import { RemovePhotoContainer } from '../../_photos/remove-photo-container';
import { pageMetadata } from '../../page-metadata';

type Props = PageProps<'/[locale]/comrade/[username]'>;

async function findPerson(raw: string) {
    const username = decodeURIComponent(raw).toLowerCase();
    if (handleProblem(username)) return { username, uid: null, person: null };
    const uid = await getUidByUsername(username);
    const person = uid ? await getUserProfile(uid) : null;
    return {
        username,
        uid,
        person:
            person?.displayName && person.username === username ? person : null,
    };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username, uid, person } = await findPerson((await params).username);
    // Kept out of search engines, even public profiles (decision #31).
    const robots = { index: false, follow: false };
    if (!uid || !person)
        return {
            title: (await getTranslations('NotFound.person'))('metaTitle'),
            robots,
        };
    // Link previews are fetched signed out and kept by the apps that fetch
    // them, so they show only what a signed-out visitor sees, whoever is
    // looking at the page (decision #72).
    const name = person.displayName!;
    const view = profileView(
        {
            name,
            username,
            areaLabel: person.location?.label,
            photo: person.photo?.large,
            settings: person.profile,
            groups: [],
        },
        'public',
        new Set()
    );
    const t = await getTranslations('Profile');
    const metadata = await pageMetadata({
        path: profilePath(username),
        title: `${name} (@${username})`,
        description:
            snippet(profileSummary(view)) || t('metaDescription', { name }),
        type: 'profile',
        image: {
            url: shareCardPath(
                'person',
                username,
                shareCardVersion(name, view.photo ? person.photo?.id : '')
            ),
            alt: t('cardAlt', { name }),
        },
    });
    return { ...metadata, robots };
}

// The viewer decides what's shown, so it streams behind <Suspense>. Every
// privacy rule is applied here on the server (src/lib/profiles.ts); the page
// only receives what this viewer may see. Design: features/17-profiles.md.
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<ProfilePageLoading />}>
            <ProfileServerContainer params={params} />
        </Suspense>
    );
}

async function ProfileServerContainer({ params }: Pick<Props, 'params'>) {
    const raw = (await params).username;
    const { username, uid, person } = await findPerson(raw);
    if (!uid || !person) notFound();
    if (raw !== username)
        return redirect({
            href: `/comrade/${username}`,
            locale: await getLocale(),
        });

    const viewer = await getSessionUser();
    const isSelf = viewer?.uid === uid;
    const [groups, viewerMemberships] = await Promise.all([
        getProfileGroups(uid),
        viewer && !isSelf ? getMemberships(viewer.uid) : Promise.resolve([]),
    ]);
    const viewerOrgIds = new Set(viewerMemberships.map((m) => m.orgId));
    const view = profileView(
        {
            name: person.displayName!,
            username,
            areaLabel: person.location?.label,
            photo: person.photo?.large,
            settings: person.profile,
            groups,
        },
        profileViewer({
            isSelf,
            signedIn: !!viewer,
            sharesGroup: groups.some((g) => viewerOrgIds.has(g.orgId)),
        }),
        viewerOrgIds
    );
    return (
        <ProfilePage
            view={view}
            isSelf={isSelf}
            moderation={
                // Super users can remove a photo they can see (decision #71).
                !isSelf && isPlatformAdmin(viewer?.uid) ? (
                    <RemovePhotoContainer
                        kind="users"
                        id={uid}
                        name={view.name}
                        hasPhoto={!!view.photo}
                    />
                ) : undefined
            }
        />
    );
}
