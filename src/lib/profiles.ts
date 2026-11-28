// Member profiles: what's on them and who sees what. Pure (no React, Next or
// Firebase): the profile page, the settings preview and tests all use it.
// Design: documentation/features/17-profiles.md (decision #31).

import { ORG_LANGUAGES, type OrgLanguage } from './organizations/options';
import { socialLinksOf, type SocialLink } from './socials';

/** Stored keys; never rename. `groups` is the default. */
export const PROFILE_VISIBILITIES = ['public', 'groups', 'name'] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];
export const DEFAULT_PROFILE_VISIBILITY: ProfileVisibility = 'groups';

/**
 * Who may send a comrade request (decision #74). Stored keys; never rename.
 * `anyone` (signed in) is the default.
 */
export const COMRADE_REQUEST_SETTINGS = ['anyone', 'groups', 'nobody'] as const;
export type ComradeRequestSetting = (typeof COMRADE_REQUEST_SETTINGS)[number];

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
    /** The organizations they endorse: on or off (decision #73). */
    endorsements: { show: boolean };
    /** Their comrades list (on or off), and who may send them requests (decision #74). */
    comrades: { show: boolean; requests: ComradeRequestSetting };
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
        endorsements: { show: d.endorsements?.show !== false },
        comrades: {
            show: d.comrades?.show !== false,
            requests: (COMRADE_REQUEST_SETTINGS as readonly unknown[]).includes(
                d.comrades?.requests
            )
                ? d.comrades!.requests
                : 'anyone',
        },
    };
}

/**
 * Who is looking: the person themself, one of their comrades, someone
 * sharing an active group with them, another signed-in person, or someone
 * signed out.
 */
export type ProfileViewer =
    'self' | 'comrade' | 'groupmate' | 'signedIn' | 'public';

export function profileViewer({
    isSelf,
    signedIn,
    sharesGroup,
    isComrade = false,
}: {
    isSelf: boolean;
    signedIn: boolean;
    sharesGroup: boolean;
    /** They're comrades (an accepted request, decision #74). */
    isComrade?: boolean;
}): ProfileViewer {
    if (isSelf) return 'self';
    if (!signedIn) return 'public';
    if (isComrade) return 'comrade';
    return sharesGroup ? 'groupmate' : 'signedIn';
}

/** How private each level is: higher shares with fewer people. */
const PRIVACY_RANK: Record<ProfileVisibility, number> = {
    public: 0,
    groups: 1,
    name: 2,
};

/**
 * Whether a change shares with fewer people. Then a photo's link is changed
 * (rotated), so a copy someone saved while they could see it stops working.
 */
export function isStricter(
    before: ProfileVisibility,
    after: ProfileVisibility
): boolean {
    return PRIVACY_RANK[after] > PRIVACY_RANK[before];
}

/**
 * Whether this viewer sees more than the name. Comrades see the details at
 * every level (decision #74): "Only my comrades" is stored as `name`.
 */
export function seesDetails(
    visibility: ProfileVisibility,
    viewer: ProfileViewer
): boolean {
    if (viewer === 'self' || viewer === 'comrade' || visibility === 'public')
        return true;
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

/**
 * An organization the person endorses (decision #73): anyone can endorse a
 * listed group, member or not, to show it off on their profile.
 */
export interface ProfileEndorsement {
    orgId: string;
    name: string;
    handle: string;
    /** The logo's small link. */
    photo?: string;
    /** Whether the group is listed now (it may have become unlisted since). */
    listed: boolean;
}

/**
 * The endorsements a viewer may see. They follow the profile visibility like
 * the bio, and the person can turn the list off. A group that has become
 * unlisted since shows only to its own members, so a profile never makes an
 * unlisted group findable. The person themself sees everything.
 */
export function visibleEndorsements(
    endorsements: ProfileEndorsement[],
    settings: ProfileSettings,
    viewer: ProfileViewer,
    viewerOrgIds: ReadonlySet<string>
): ProfileEndorsement[] {
    if (viewer === 'self') return endorsements;
    if (!seesDetails(settings.visibility, viewer)) return [];
    if (!settings.endorsements.show) return [];
    return endorsements.filter((e) => e.listed || viewerOrgIds.has(e.orgId));
}

/** One of the person's comrades, with what decides whether they may be listed. */
export interface ProfileComrade {
    uid: string;
    name: string;
    username: string;
    /** Their small photo link, if they've added one. */
    photo?: string;
    /** Their own profile visibility. */
    visibility: ProfileVisibility;
}

/** A comrade as one viewer sees them in a list: the photo only if they may. */
export interface ComradeView {
    uid: string;
    name: string;
    username: string;
    photo?: string;
}

/**
 * The comrades a viewer may see on a profile (decision #74). A comrades list
 * shows who knows whom, so both people's privacy counts: the list follows
 * the owner's visibility and their "show my comrades" choice, and each
 * comrade is listed only if their own visibility would show this viewer
 * their details. `relationOf` is how the viewer relates to each comrade
 * (missing means a signed-in stranger, or `public` when signed out). The
 * person themself sees everyone.
 */
export function visibleComrades(
    comrades: ProfileComrade[],
    settings: ProfileSettings,
    viewer: ProfileViewer,
    relationOf: ReadonlyMap<string, ProfileViewer>
): ComradeView[] {
    const fallback: ProfileViewer = viewer === 'public' ? 'public' : 'signedIn';
    const shown =
        viewer === 'self'
            ? comrades
            : !seesDetails(settings.visibility, viewer) ||
                !settings.comrades.show
              ? []
              : comrades.filter((c) =>
                    seesDetails(c.visibility, relationOf.get(c.uid) ?? fallback)
                );
    return shown.map((c) => ({
        uid: c.uid,
        name: c.name,
        username: c.username,
        photo: visiblePhoto(
            c.photo,
            c.visibility,
            relationOf.get(c.uid) ?? (viewer === 'self' ? 'comrade' : fallback)
        ),
    }));
}

/**
 * A person's photo link for one viewer: it follows their profile visibility,
 * like the bio, so "Just my name" means no photo either. Used wherever a
 * person appears (member lists, comments, the header).
 */
export function visiblePhoto(
    photo: string | undefined,
    visibility: ProfileVisibility,
    viewer: ProfileViewer
): string | undefined {
    return photo && seesDetails(visibility, viewer) ? photo : undefined;
}

/** Exactly what a viewer is shown. `details` is null when they see only the name. */
export interface ProfileView {
    name: string;
    username: string;
    pronouns?: string;
    /** The large photo link, only when the viewer sees details. */
    photo?: string;
    details: null | {
        bio?: string;
        languages: OrgLanguage[];
        /** City name, only when the person turned it on. */
        area?: string;
        socials: SocialLink[];
        website?: string;
        groups: ProfileGroup[];
        endorsements: ProfileEndorsement[];
        comrades: ComradeView[];
    };
}

export function profileView(
    person: {
        name: string;
        username: string;
        areaLabel?: string;
        /** The large photo link, if they've added one. */
        photo?: string;
        settings: ProfileSettings;
        groups: ProfileGroup[];
        /** Organizations they endorse, newest first. */
        endorsements?: ProfileEndorsement[];
        /** Their comrades, newest first. */
        comrades?: ProfileComrade[];
    },
    viewer: ProfileViewer,
    viewerOrgIds: ReadonlySet<string>,
    /** How the viewer relates to each comrade (see visibleComrades). */
    comradeRelations: ReadonlyMap<string, ProfileViewer> = new Map()
): ProfileView {
    const { settings } = person;
    const details = seesDetails(settings.visibility, viewer);
    return {
        name: person.name,
        username: person.username,
        // Pronouns go with the name only when details are visible; they're
        // personal, so "Just my name" means just the name.
        pronouns: details ? settings.pronouns : undefined,
        photo: visiblePhoto(person.photo, settings.visibility, viewer),
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
                  endorsements: visibleEndorsements(
                      person.endorsements ?? [],
                      settings,
                      viewer,
                      viewerOrgIds
                  ),
                  comrades: visibleComrades(
                      person.comrades ?? [],
                      settings,
                      viewer,
                      comradeRelations
                  ),
              }
            : null,
    };
}

/**
 * A short line about the person for link previews: pronouns, city and bio,
 * as far as `view` shows them. Build `view` for a signed-out viewer: link
 * previews are fetched signed out and kept by the apps that fetch them.
 * Empty when nothing is shared (use a generic line then).
 */
export function profileSummary(view: ProfileView): string {
    if (!view.details) return '';
    const facts = [view.pronouns, view.details.area]
        .filter(Boolean)
        .join(' · ');
    const bio = view.details.bio?.replace(/\s+/g, ' ').trim();
    return [facts, bio].filter(Boolean).join('. ');
}
