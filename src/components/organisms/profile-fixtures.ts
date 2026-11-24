// Sample profiles for stories (not used by the app).
import {
    profileSettingsOf,
    profileView,
    type ProfileGroup,
} from '@/lib/profiles';

export const sampleGroups: ProfileGroup[] = [
    {
        orgId: 'sbma',
        name: 'South Bay Mutual Aid',
        handle: 'sbma',
        role: 'owner',
        listed: true,
        memberList: 'members',
    },
    {
        orgId: 'auto',
        name: 'Oakland Auto Club',
        handle: 'oakland-auto-club',
        role: 'moderator',
        listed: true,
        memberList: 'public',
    },
    {
        orgId: 'tenants',
        name: 'Alum Rock Tenants Union',
        handle: 'alum-rock-tenants',
        role: 'owner',
        listed: false,
        memberList: 'hidden',
    },
];

export const sampleSettings = profileSettingsOf({
    visibility: 'public',
    pronouns: 'she/her',
    bio: 'Organizer with South Bay Mutual Aid. I drive the Tuesday grocery route and can help with tenant paperwork.',
    languages: ['en', 'es'],
    showArea: true,
    website: 'https://example.com/',
    socials: [{ platform: 'instagram', handle: 'example' }],
});

export const samplePerson = {
    name: 'Maya Thompson',
    username: 'maya-thompson',
    areaLabel: 'San Jose, California',
    settings: sampleSettings,
    groups: sampleGroups,
};

/** As someone signed out sees it: the unlisted tenants union never shows. */
export const publicView = profileView(samplePerson, 'public', new Set());
/** As she sees it herself: everything. */
export const selfView = profileView(samplePerson, 'self', new Set());
/** "Just my name". */
export const privateView = profileView(
    { ...samplePerson, settings: { ...sampleSettings, visibility: 'name' } },
    'public',
    new Set()
);
