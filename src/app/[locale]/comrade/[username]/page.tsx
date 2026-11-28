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
import { acceptsRequestsFrom, comradeStateWith } from '@/lib/comrades';
import { relationsTo } from '@/lib/comrades/relations';
import { getComradeships, getProfileComrades } from '@/lib/comrades/store';
import { getProfileEndorsements } from '@/lib/endorsements/store';
import { getMemberships, getProfileGroups } from '@/lib/organizations';
import { profilePath } from '@/lib/paths';
import { profileSummary, profileView, profileViewer } from '@/lib/profiles';
import { snippet } from '@/lib/seo';
import { shareCardPath, shareCardVersion } from '@/lib/share-cards';
import { redirect } from '@/i18n/navigation';

import { findPerson } from './find-person';
import { RemovePhotoContainer } from '../../_photos/remove-photo-container';
import { ComradeButtonContainer } from './comrade-button-container';
import { pageMetadata } from '../../page-metadata';

type Props = PageProps<'/[locale]/comrade/[username]'>;

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
    // Sections of the page: if one fails, it says so and the rest shows
    // (decision #68).
    const quietly =
        (area: string) =>
        (error: Error): null => {
            console.error(`[${area}] profile read failed`, error.message);
            return null;
        };
    const [groups, viewerMemberships, endorsements, comrades, viewerPairs] =
        await Promise.all([
            getProfileGroups(uid),
            viewer && !isSelf
                ? getMemberships(viewer.uid)
                : Promise.resolve([]),
            getProfileEndorsements(uid).catch(quietly('endorsements')),
            getProfileComrades(uid).catch(quietly('comrades')),
            viewer && !isSelf
                ? getComradeships(viewer.uid).catch(quietly('comrades'))
                : Promise.resolve([]),
        ]);
    const viewerOrgIds = new Set(viewerMemberships.map((m) => m.orgId));
    const state = viewer
        ? comradeStateWith(viewer.uid, uid, viewerPairs ?? [])
        : null;
    // If the viewer's comradeships can't be read, they're treated as not
    // comrades: the page shows less, never more.
    const sharesGroup = groups.some((g) => viewerOrgIds.has(g.orgId));
    const relation = profileViewer({
        isSelf,
        signedIn: !!viewer,
        sharesGroup,
        isComrade: state === 'comrades',
    });
    // No "Add comrade" when their setting wouldn't take a request from this
    // viewer (or from anyone, when signed out). The server checks again.
    const requests = person.profile.comrades.requests;
    const canAsk = viewer
        ? acceptsRequestsFrom(requests, sharesGroup)
        : requests !== 'nobody';
    const showButton =
        !isSelf && (canAsk || (state !== null && state !== 'none'));
    const view = profileView(
        {
            name: person.displayName!,
            username,
            areaLabel: person.location?.label,
            photo: person.photo?.large,
            settings: person.profile,
            groups,
            endorsements: endorsements ?? [],
            comrades: comrades ?? [],
        },
        relation,
        viewerOrgIds,
        // How the viewer relates to each comrade, for whose details (and so
        // whose place on the list) they may see.
        await relationsTo(viewer?.uid ?? null, comrades ?? [])
    );
    // Only when this viewer would see the section: a hidden list stays hidden.
    const wouldSee = (show: boolean) => !!view.details && (isSelf || show);
    return (
        <ProfilePage
            view={view}
            isSelf={isSelf}
            endorsementsFailed={
                endorsements === null &&
                wouldSee(person.profile.endorsements.show)
            }
            comradesFailed={
                comrades === null && wouldSee(person.profile.comrades.show)
            }
            comrade={
                showButton ? (
                    <ComradeButtonContainer
                        state={state ?? 'signedOut'}
                        uid={uid}
                        name={view.name}
                        next={profilePath(username)}
                        loadFailed={!!viewer && viewerPairs === null}
                    />
                ) : undefined
            }
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
