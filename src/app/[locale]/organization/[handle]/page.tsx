import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { DiscussionListLoading } from '@/components/organisms/discussion';
import { NearbyOrganizations } from '@/components/organisms/nearby-organizations';
import {
    OrganizationPage,
    OrganizationPageLoading,
} from '@/components/pages/organization-page';
import { isPlatformAdmin } from '@/lib/auth/platform-admin';
import { getSessionUser } from '@/lib/auth/session';
import {
    getDirectoryLocal,
    getMembershipFresh,
    getOrganizationByHandle,
    getOrganizationByHandleFresh,
    getOrgPeople,
    type Organization,
} from '@/lib/organizations';
import {
    isStaff,
    joinState,
    sortMembers,
    visibleMembers,
} from '@/lib/organizations/membership';
import {
    DEFAULT_FILTERS,
    directoryHref,
    NEARBY_RADIUS_MILES,
    nearbyOrganizations,
} from '@/lib/organizations/directory';
import { handleProblem } from '@/lib/organizations/handle';
import { getPlace } from '@/lib/places';
import { isSupportedCountry } from '@/lib/places/types';
import { makeUnclaimedProblem } from '@/lib/organizations/lifecycle';
import { phoneForDisplay } from '@/lib/phone';
import { profileViewer, visiblePhoto } from '@/lib/profiles';
import { redirect } from '@/i18n/navigation';
import { organizationPath } from '@/lib/paths';
import { keywordList, snippet } from '@/lib/seo';
import { getSiteUrl } from '@/lib/site';
import { socialUrl } from '@/lib/socials';

import { makeUnclaimedAction } from './actions';
import { JsonLd } from '../../json-ld';
import type { Locale } from '@/i18n/routing';

import { DiscussionContainer } from '../../_discussion/discussion-container';
import { pageMetadata } from '../../page-metadata';
import { TrackEvent } from '../../track-event';
import { RemovePhotoContainer } from '../../_photos/remove-photo-container';
import { JoinPanelContainer } from './join-panel-container';

type Props = PageProps<'/[locale]/organization/[handle]'>;

/** Cached lookup; a miss is confirmed fresh (it may have just been created on another instance). */
async function findOrganization(raw: string) {
    // Per request, like the page: a miss is confirmed with a fresh read,
    // which Next otherwise flags while prerendering.
    await connection();
    const handle = decodeURIComponent(raw).toLowerCase();
    if (handleProblem(handle)) return { handle, org: null };
    const org =
        (await getOrganizationByHandle(handle)) ??
        (await getOrganizationByHandleFresh(handle));
    return { handle, org };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { org } = await findOrganization((await params).handle);
    // Its not-found page says the rest (./not-found.tsx).
    if (!org)
        return {
            title: (await getTranslations('NotFound.organization'))(
                'metaTitle'
            ),
        };
    const t = await getTranslations('Organizations');
    const names = { name: org.name, place: org.location.label };
    const areas = org.focusAreas.map((area) => t(`focusAreas.${area}`));
    const metadata = await pageMetadata({
        path: organizationPath(org.handle),
        // The name stays as the group wrote it; never re-capitalized.
        title: t('metaTitle', names),
        description: org.description.trim()
            ? snippet(org.description)
            : t('metaDescription', names),
        keywords: keywordList(
            [org.name],
            areas,
            // The city's name alone: a label's comma would split a keyword.
            t('metaKeywords', { city: org.location.label.split(',')[0] })
        ),
    });
    // Unlisted groups don't want to be found, and archived ones are gone:
    // keep both out of search engines.
    return org.visibility === 'unlisted' || org.status === 'archived'
        ? { ...metadata, robots: { index: false, follow: false } }
        : metadata;
}

/** What search engines read about a listed group (technical/seo.md). */
function organizationJsonLd(org: Organization, url: string) {
    const sameAs = [
        ...(org.website ? [org.website] : []),
        ...org.socials.map(({ platform, handle }) =>
            socialUrl(platform, handle)
        ),
    ];
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url,
        ...(org.description.trim()
            ? { description: snippet(org.description, 500) }
            : {}),
        ...(org.foundedYear ? { foundingDate: String(org.foundedYear) } : {}),
        // The general area only, as on the page's header.
        areaServed: { '@type': 'Place', name: org.location.label },
        ...(sameAs.length ? { sameAs } : {}),
    };
}

// The handle and membership are per request, so they stream behind <Suspense>.
export default function Page({ params }: Props) {
    return (
        <Suspense fallback={<OrganizationPageLoading />}>
            <OrganizationContainer params={params} />
        </Suspense>
    );
}

async function OrganizationContainer({ params }: Pick<Props, 'params'>) {
    const raw = (await params).handle;
    const { handle, org } = await findOrganization(raw);
    if (!org) notFound();
    if (raw !== handle) {
        return redirect({
            href: organizationPath(handle),
            locale: await getLocale(),
        });
    }

    const profile = {
        name: org.name,
        handle: org.handle,
        focusAreas: org.focusAreas,
        description: org.description,
        place: org.location.label,
        reach: org.reach,
        languages: org.languages,
        memberCount: org.memberCount,
        photo: org.photo?.large,
        streetAddress: org.streetAddress,
        website: org.website,
        contactEmail: org.contactEmail,
        phone: phoneForDisplay(org.phone) ?? undefined,
        foundedYear: org.foundedYear,
        socials: org.socials,
        unlisted: org.visibility === 'unlisted',
    };
    const [user, nearby] = await Promise.all([
        getSessionUser(),
        nearbySection(org),
    ]);

    const locale = await getLocale();
    const view = (
        <>
            <TrackEvent event="org-view" data={{ org: org.handle }} />
            {org.visibility === 'listed' && org.status === 'active' && (
                <JsonLd
                    data={organizationJsonLd(
                        org,
                        `${getSiteUrl()}/${locale}${organizationPath(org.handle)}`
                    )}
                />
            )}
        </>
    );

    // Listed, active organizations only: unlisted groups don't want to be
    // found (decision #70). `replier` only shows the Reply buttons; the
    // server checks the role fresh.
    const discussion = (replier: boolean) =>
        org.visibility === 'listed' && org.status === 'active' ? (
            <Suspense fallback={<DiscussionListLoading />}>
                <DiscussionContainer
                    target={{ kind: 'organization', id: org.id }}
                    href={organizationPath(org.handle)}
                    locale={locale as Locale}
                    organization={{
                        name: org.name,
                        replier,
                        unclaimed: org.unclaimed,
                    }}
                />
            </Suspense>
        ) : null;

    // Unclaimed: no members, no joining. Super users manage it as owners.
    if (org.unclaimed) {
        return (
            <>
                {view}
                <OrganizationPage
                    role={null}
                    join={null}
                    members={{
                        people: [],
                        total: 0,
                        setting: org.memberListVisibility,
                        viewerIsMember: false,
                    }}
                    profile={profile}
                    unclaimed={{ canManage: isPlatformAdmin(user?.uid) }}
                    nearby={nearby}
                    discussion={discussion(isPlatformAdmin(user?.uid))}
                />
            </>
        );
    }

    // Members-only content is an access decision: always a fresh read.
    const [membership, people] = await Promise.all([
        user ? getMembershipFresh(org.id, user.uid) : null,
        getOrgPeople(org.id),
    ]);
    const role = membership?.status === 'active' ? membership.role : null;

    // Requests and bans are staff-only: only active members leave this function.
    const active = sortMembers(
        people.filter((p) => p.status === 'active'),
        locale
    );
    const named =
        visibleMembers(org.memberListVisibility, role) === 'everyone'
            ? active
            : active.filter((p) => p.role !== 'member');

    return (
        <>
            {view}
            <OrganizationPage
                role={role}
                join={
                    <JoinPanelContainer
                        state={joinState(!!user, org.joinPolicy, membership)}
                        orgId={org.id}
                        handle={org.handle}
                        name={org.name}
                    />
                }
                members={{
                    people: named.map(
                        ({
                            uid,
                            displayName,
                            username,
                            role,
                            photo,
                            visibility,
                        }) => ({
                            uid,
                            displayName,
                            username,
                            role,
                            // Each person's photo follows their own profile
                            // visibility; old copies without one show none.
                            photo: visiblePhoto(
                                photo,
                                visibility ?? 'name',
                                profileViewer({
                                    isSelf: uid === user?.uid,
                                    signedIn: !!user,
                                    sharesGroup: !!role,
                                })
                            ),
                        })
                    ),
                    total: active.length,
                    setting: org.memberListVisibility,
                    viewerIsMember: !!role,
                }}
                nearby={nearby}
                discussion={discussion(isStaff(role))}
                moderation={
                    isPlatformAdmin(user?.uid) ? (
                        <RemovePhotoContainer
                            kind="organizations"
                            id={org.id}
                            name={org.name}
                            hasPhoto={!!org.photo}
                        />
                    ) : undefined
                }
                makeUnclaimed={
                    // Shown only when it would work; the action checks again.
                    makeUnclaimedProblem({
                        platformAdmin: isPlatformAdmin(user?.uid),
                        role,
                        unclaimed: false,
                        activeMembers: active.length,
                    }) === null
                        ? {
                              orgId: org.id,
                              locale,
                              formAction: makeUnclaimedAction,
                          }
                        : undefined
                }
                pendingRequests={
                    isStaff(role)
                        ? people.filter((p) => p.status === 'pending').length
                        : 0
                }
                profile={{ ...profile, memberCount: active.length }}
            />
        </>
    );
}

/**
 * Up to 4 other local organizations within 50 mi of this one's city, closest
 * first. One cached read per city (shared with /find/organizations and the dashboard).
 */
async function nearbySection(org: {
    id: string;
    location: {
        placeId: string;
        country: string;
        label: string;
        lat: number;
        lng: number;
    };
}) {
    const { location } = org;
    if (!isSupportedCountry(location.country)) return null;
    const [candidates, t] = await Promise.all([
        getDirectoryLocal({
            placeId: location.placeId,
            lat: location.lat,
            lng: location.lng,
        }),
        getTranslations('Organizations.page'),
    ]);
    const nearby = nearbyOrganizations(candidates, {
        id: org.id,
        country: location.country,
        lat: location.lat,
        lng: location.lng,
    });
    return (
        <NearbyOrganizations
            place={location.label}
            organizations={nearby.map(({ org: other, distanceMiles }) => ({
                name: other.name,
                handle: other.handle,
                photo: other.photo,
                focusAreas: other.focusAreas,
                unclaimed: other.unclaimed,
                detail:
                    distanceMiles < 1
                        ? t('nearbyInCity', { city: other.location.label })
                        : t('nearbyAway', {
                              miles: distanceMiles,
                              city: other.location.label,
                          }),
            }))}
            findHref={directoryHref(
                { ...DEFAULT_FILTERS, radiusMiles: NEARBY_RADIUS_MILES },
                getPlace(location.country, location.placeId)?.slug
            )}
        />
    );
}
