// Member profiles: what's on them and who sees what. Pure (no React, Next or
// Firebase): the profile page, the settings preview and tests all use it.
// Design: documentation/features/17-profiles.md (decision #31).

import { ORG_LANGUAGES, type OrgLanguage } from './organizations/options';
import { socialLinksOf, type SocialLink } from './socials';

/** Stored keys; never rename. `groups` is the default. */
export const PROFILE_VISIBILITIES = ['public', 'groups', 'name'] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];
export const DEFAULT_PROFILE_VISIBILITY: ProfileVisibility = 'groups';

export const BIO_MAX = 300;
export const PRONOUNS_MAX = 40;

/** What a person chose to put on their profile, and who may see it. */
export interface ProfileSettings {
    visibility: ProfileVisibility;
    pronouns?: string;
    bio?: string;
    languages: OrgLanguage[];
    /** Show their saved city's name (never more precise). */
    showArea: boolean;
    socials: SocialLink[];
    website?: string;
    /** The groups list: on or off, and groups they've hidden (organization ids). */
    groups: { show: boolean; hidden: string[] };
}

/** Reads stored settings leniently: anything missing gets the private-by-default value. */
export function profileSettingsOf(data: unknown): ProfileSettings {
    const d = (data ?? {}) as Partial<ProfileSettings>;
    return {
        visibility: (PROFILE_VISIBILITIES as readonly unknown[]).includes(
            d.visibility
        )
            ? d.visibility!
            : DEFAULT_PROFILE_VISIBILITY,
        pronouns: d.pronouns || undefined,
        bio: d.bio || undefined,
        languages: (d.languages ?? []).filter((l) =>
            (ORG_LANGUAGES as readonly string[]).includes(l)
        ),
        showArea: d.showArea === true,
        socials: socialLinksOf(d.socials),
        website: d.website || undefined,
        groups: {
            show: d.groups?.show !== false,
            hidden: Array.isArray(d.groups?.hidden) ? d.groups!.hidden : [],
        },
    };
}

/**
 * Who is looking: the person themself, someone sharing an active group with
 * them, another signed-in person, or someone signed out.
 */
export type ProfileViewer = 'self' | 'groupmate' | 'signedIn' | 'public';

export function profileViewer({
    isSelf,
    signedIn,
    sharesGroup,
}: {
    isSelf: boolean;
    signedIn: boolean;
    sharesGroup: boolean;
}): ProfileViewer {
    if (isSelf) return 'self';
    if (!signedIn) return 'public';
    return sharesGroup ? 'groupmate' : 'signedIn';
}

/** Whether this viewer sees more than the name. */
export function seesDetails(
    visibility: ProfileVisibility,
    viewer: ProfileViewer
): boolean {
    if (viewer === 'self' || visibility === 'public') return true;
    if (visibility === 'groups') return viewer === 'groupmate';
    return false;
}

/** One of the person's groups, with what decides whether it may be listed. */
export interface ProfileGroup {
    orgId: string;
    name: string;
    handle: string;
    role: 'owner' | 'moderator' | 'member';
    /** The group's own settings. */
    listed: boolean;
    memberList: 'public' | 'members' | 'hidden';
}

/**
 * The groups a viewer may see on a profile. A group is listed only if the
 * viewer could already see this person on that group's page, so a profile
 * never undoes a group's privacy: the viewer is a member of it, or (for a
 * listed group) the person is an owner or moderator there, who are always
 * named, or the group's member list is public. Unlisted groups show only to
 * their own members. On top of that, the person can hide the list or single
 * groups. The person themself sees everything.
 */
export function visibleGroups(
    groups: ProfileGroup[],
    settings: ProfileSettings,
    viewer: ProfileViewer,
    viewerOrgIds: ReadonlySet<string>
): ProfileGroup[] {
    if (viewer === 'self') return groups;
    if (!seesDetails(settings.visibility, viewer)) return [];
    if (!settings.groups.show) return [];
    return groups.filter((group) => {
        if (settings.groups.hidden.includes(group.orgId)) return false;
        if (viewerOrgIds.has(group.orgId)) return true;
        if (!group.listed) return false;
        return group.role !== 'member' || group.memberList === 'public';
    });
}

/** Exactly what a viewer is shown. `details` is null when they see only the name. */
export interface ProfileView {
    name: string;
    username: string;
    pronouns?: string;
    details: null | {
        bio?: string;
        languages: OrgLanguage[];
        /** City name, only when the person turned it on. */
        area?: string;
        socials: SocialLink[];
        website?: string;
        groups: ProfileGroup[];
    };
}

export function profileView(
    person: {
        name: string;
        username: string;
        areaLabel?: string;
        settings: ProfileSettings;
        groups: ProfileGroup[];
    },
    viewer: ProfileViewer,
    viewerOrgIds: ReadonlySet<string>
): ProfileView {
    const { settings } = person;
    const details = seesDetails(settings.visibility, viewer);
    return {
        name: person.name,
        username: person.username,
        // Pronouns go with the name only when details are visible; they're
        // personal, so "Just my name" means just the name.
        pronouns: details ? settings.pronouns : undefined,
        details: details
            ? {
                  bio: settings.bio,
                  languages: settings.languages,
                  area: settings.showArea ? person.areaLabel : undefined,
                  socials: settings.socials,
                  website: settings.website,
                  groups: visibleGroups(
                      person.groups,
                      settings,
                      viewer,
                      viewerOrgIds
                  ),
              }
            : null,
    };
}
