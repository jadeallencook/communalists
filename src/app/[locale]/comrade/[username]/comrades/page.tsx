import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import {
    ComradesPage,
    ComradesPageLoading,
} from '@/components/pages/comrades-page';
import { getSessionUser } from '@/lib/auth/session';
import { relationsTo } from '@/lib/comrades/relations';
import { getComradeUids, getProfileComrades } from '@/lib/comrades/store';
import { getMemberships, getProfileGroups } from '@/lib/organizations';
import { comradesPath } from '@/lib/paths';
import { profileViewer, seesDetails, visibleComrades } from '@/lib/profiles';
import { redirect } from '@/i18n/navigation';

import { findPerson } from '../find-person';

type Props = PageProps<'/[locale]/comrade/[username]/comrades'>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { person } = await findPerson((await params).username);
    // Kept out of search engines, like profiles (decision #31).
    const robots = { index: false, follow: false };
    if (!person)
        return {
            title: (await getTranslations('NotFound.person'))('metaTitle'),
            robots,
        };
    const t = await getTranslations('Comrades');
    return {
        title: t('listMetaTitle', { name: person.displayName! }),
        robots,
    };
}

// The viewer decides who's listed, so it streams behind <Suspense>. The same
// rules as the profile's Comrades section (src/lib/profiles.ts).
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<ComradesPageLoading />}>
            <ComradesServerContainer params={params} />
        </Suspense>
    );
}

async function ComradesServerContainer({ params }: Pick<Props, 'params'>) {
    const raw = (await params).username;
    const { username, uid, person } = await findPerson(raw);
    if (!uid || !person) notFound();
    if (raw !== username)
        return redirect({
            href: comradesPath(username),
            locale: await getLocale(),
        });

    const viewer = await getSessionUser();
    const isSelf = viewer?.uid === uid;
    const [groups, viewerMemberships, viewerComrades, comrades] =
        await Promise.all([
            getProfileGroups(uid),
            viewer && !isSelf
                ? getMemberships(viewer.uid)
                : Promise.resolve([]),
            viewer && !isSelf
                ? getComradeUids(viewer.uid).catch(() => new Set<string>())
                : Promise.resolve(new Set<string>()),
            getProfileComrades(uid).catch((error: Error) => {
                console.error('[comrades] list read failed', error.message);
                return null;
            }),
        ]);
    const viewerOrgIds = new Set(viewerMemberships.map((m) => m.orgId));
    const relation = profileViewer({
        isSelf,
        signedIn: !!viewer,
        sharesGroup: groups.some((g) => viewerOrgIds.has(g.orgId)),
        isComrade: viewerComrades.has(uid),
    });
    const settings = person.profile;
    const hidden =
        !isSelf &&
        (!seesDetails(settings.visibility, relation) ||
            !settings.comrades.show);
    const name = person.displayName!;
    if (hidden)
        return <ComradesPage name={name} username={username} comrades={null} />;
    if (!comrades)
        return (
            <ComradesPage
                name={name}
                username={username}
                comrades={[]}
                loadFailed
            />
        );
    return (
        <ComradesPage
            name={name}
            username={username}
            comrades={visibleComrades(
                comrades,
                settings,
                relation,
                await relationsTo(viewer?.uid ?? null, comrades)
            )}
        />
    );
}
