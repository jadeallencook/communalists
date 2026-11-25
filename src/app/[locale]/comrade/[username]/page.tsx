import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';

import {
    ProfilePage,
    ProfilePageLoading,
} from '@/components/pages/profile-page';
import { getSessionUser } from '@/lib/auth/session';
import { getMemberships, getProfileGroups } from '@/lib/organizations';
import { handleProblem } from '@/lib/organizations/handle';
import { PhotoEditor } from '@/components/organisms/photo-editor';
import { photoUrl } from '@/lib/photos';
import { profileView, profileViewer } from '@/lib/profiles';
import { getUidByUsername, getUserProfile } from '@/lib/users';
import { redirect } from '@/i18n/navigation';

import { saveProfilePhotoAction } from '@/app/[locale]/account/profile/actions';

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
    const { person } = await findPerson((await params).username);
    // Kept out of search engines, even public profiles (decision #31).
    return {
        title: person?.displayName,
        robots: { index: false, follow: false },
    };
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
            photoUrl: photoUrl('user', uid, person.photoVersion),
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
            photoEditor={
                isSelf ? (
                    <PhotoEditor
                        name={view.name}
                        photoUrl={view.photoUrl}
                        audience="profile"
                        saveAction={saveProfilePhotoAction}
                    />
                ) : undefined
            }
        />
    );
}
