import { z } from 'zod';

import { normalizeWebUrl, ORG_LANGUAGES } from '@/lib/organizations/options';
import {
    BIO_MAX,
    PRONOUNS_MAX,
    PROFILE_VISIBILITIES,
    type ProfileSettings,
} from '@/lib/profiles';
import { socialFormValues, socialLinksSchema } from '@/lib/validation/socials';

// The /account/profile form. Errors are keys under Profile.errors.
export type ProfileErrorKey =
    | 'required'
    | 'bioTooLong'
    | 'pronounsTooLong'
    | 'invalidUrl'
    | 'socialInvalid'
    | 'socialMismatch'
    | 'socialDuplicate'
    | 'generic';

const webUrl = z
    .string()
    .trim()
    .transform((value, ctx) => {
        if (!value) return undefined;
        const url = normalizeWebUrl(value);
        if (!url) {
            ctx.addIssue({ code: 'custom', message: 'invalidUrl' });
            return z.NEVER;
        }
        return url;
    });

export const profileSettingsSchema = z.object({
    visibility: z.enum(PROFILE_VISIBILITIES, { error: 'required' }),
    pronouns: z
        .string()
        .trim()
        .max(PRONOUNS_MAX, { error: 'pronounsTooLong' })
        .transform((v) => v || undefined),
    bio: z
        .string()
        .trim()
        .max(BIO_MAX, { error: 'bioTooLong' })
        .transform((v) => v || undefined),
    languages: z.array(z.enum(ORG_LANGUAGES)).max(ORG_LANGUAGES.length),
    showArea: z.boolean(),
    website: webUrl,
    socials: socialLinksSchema,
    groupsShow: z.boolean(),
    /** Groups ticked "show on my profile". The server works out the hidden ones. */
    shownGroups: z.array(z.string().max(128)).max(500),
    endorsementsShow: z.boolean(),
});

export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type ProfileSettingsField = keyof ProfileSettingsInput;

export interface ProfileSettingsState {
    fieldErrors?: Partial<Record<ProfileSettingsField, ProfileErrorKey>>;
    formError?: ProfileErrorKey;
    saved?: boolean;
    /** Changes on every save, so "Saved" can show again. */
    at?: number;
}

/** Reads the form into the shape the schema expects. */
export function profileFormValues(formData: FormData) {
    const text = (key: string) => {
        const value = formData.get(key);
        return typeof value === 'string' ? value : '';
    };
    return {
        visibility: text('visibility'),
        pronouns: text('pronouns'),
        bio: text('bio'),
        languages: formData.getAll('languages').map(String),
        showArea: formData.get('showArea') === 'on',
        website: text('website'),
        socials: socialFormValues(formData),
        groupsShow: formData.get('groupsShow') === 'on',
        shownGroups: formData.getAll('shownGroups').map(String),
        endorsementsShow: formData.get('endorsementsShow') === 'on',
    };
}

/** The validated form as stored settings. `myGroups` are the person's organization ids. */
export function toProfileSettings(
    input: ProfileSettingsInput,
    myGroups: string[]
): ProfileSettings {
    return {
        visibility: input.visibility,
        pronouns: input.pronouns,
        bio: input.bio,
        languages: input.languages,
        showArea: input.showArea,
        website: input.website,
        socials: input.socials,
        groups: {
            show: input.groupsShow,
            hidden: myGroups.filter((id) => !input.shownGroups.includes(id)),
        },
        endorsements: { show: input.endorsementsShow },
    };
}
