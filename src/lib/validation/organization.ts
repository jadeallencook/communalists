import { z } from 'zod';

import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';
import {
    JOIN_POLICIES,
    normalizeWebUrl,
    MAX_FOCUS_AREAS,
    OFFERED_FOCUS_AREAS,
    ORG_LANGUAGES,
    RADIUS_MILES,
    REACH_SCOPES,
    MEMBER_LIST_VISIBILITIES,
    PHONE_INPUT_MAX,
    STREET_ADDRESS_MAX,
    VISIBILITIES,
    type FocusArea,
} from '@/lib/organizations/options';
import { isSupportedCountry } from '@/lib/places/types';
import { normalizePhone } from '@/lib/phone';
import { socialFormValues, socialLinksSchema } from '@/lib/validation/socials';

// The create-organization form. Messages are keys under
// Organizations.errors in messages/*.json. Design: features/16-organizations.md.

export type OrganizationErrorKey =
    | 'required'
    | 'tooShort'
    | 'tooLong'
    | 'handleTooShort'
    | 'handleTooLong'
    | 'handleFormat'
    | 'handleReserved'
    | 'handleTaken'
    | 'focusAreasRequired'
    | 'focusAreasTooMany'
    | 'placeRequired'
    | 'placeNotFound'
    | 'radiusRequired'
    | 'languagesRequired'
    | 'invalidUrl'
    | 'invalidEmail'
    | 'invalidPhone'
    | 'invalidYear'
    | 'socialInvalid'
    | 'socialMismatch'
    | 'socialDuplicate'
    | 'ownedLimit'
    | 'handleCooldown'
    | 'notAllowed'
    | 'generic';

const optionalText = z.string().trim().max(2000, { error: 'tooLong' });

/** The earliest founding year accepted (anything older is surely a typo). */
export const FOUNDED_YEAR_MIN = 1800;

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

export const organizationSchema = z
    .object({
        name: z
            .string({ error: 'required' })
            .trim()
            .min(1, { error: 'required' })
            .min(2, { error: 'tooShort' })
            .max(80, { error: 'tooLong' }),
        handle: z
            .string({ error: 'required' })
            .transform(normalizeHandle)
            .superRefine((handle, ctx) => {
                const problem = handleProblem(handle);
                if (!handle)
                    ctx.addIssue({ code: 'custom', message: 'required' });
                else if (problem)
                    ctx.addIssue({
                        code: 'custom',
                        message: `handle${problem[0].toUpperCase()}${problem.slice(1)}`,
                    });
            }),
        // Only offered (not retired) areas; repeats count once.
        focusAreas: z
            .array(
                z.enum(OFFERED_FOCUS_AREAS as [FocusArea], {
                    error: 'focusAreasRequired',
                }),
                { error: 'focusAreasRequired' }
            )
            .transform((areas) => [...new Set(areas)])
            .refine((areas) => areas.length >= 1, {
                error: 'focusAreasRequired',
            })
            .refine((areas) => areas.length <= MAX_FOCUS_AREAS, {
                error: 'focusAreasTooMany',
            }),
        description: optionalText,
        // Optional: the year the group started, shown as "Since 1983".
        foundedYear: z
            .string()
            .trim()
            .optional()
            .transform((value, ctx) => {
                if (!value) return undefined;
                const year = Number(value);
                if (
                    !/^\d{4}$/.test(value) ||
                    year < FOUNDED_YEAR_MIN ||
                    year > new Date().getFullYear()
                ) {
                    ctx.addIssue({ code: 'custom', message: 'invalidYear' });
                    return z.NEVER;
                }
                return year;
            }),
        country: z
            .string({ error: 'placeRequired' })
            .refine(isSupportedCountry, { error: 'placeRequired' }),
        placeId: z
            .string({ error: 'placeRequired' })
            .regex(/^\d{1,12}$/, { error: 'placeRequired' }),
        // Optional and public: a place people go to, never a home (features/16).
        streetAddress: z
            .string()
            .trim()
            .max(STREET_ADDRESS_MAX, { error: 'tooLong' })
            .optional()
            .transform((v) => v?.replace(/\s+/g, ' ') || undefined),
        reach: z.enum(REACH_SCOPES, { error: 'required' }),
        // Only used (and required) for local reach.
        radiusMiles: z.coerce.number().optional(),
        languages: z
            .array(z.enum(ORG_LANGUAGES))
            .min(1, { error: 'languagesRequired' })
            .max(ORG_LANGUAGES.length),
        website: webUrl,
        contactEmail: z
            .string()
            .trim()
            .toLowerCase()
            .refine((v) => !v || z.email().safeParse(v).success, {
                error: 'invalidEmail',
            })
            .transform((v) => v || undefined),
        // Parsed with the organization's country below, once it's known.
        phone: z.string().trim().max(PHONE_INPUT_MAX).optional(),
        socials: socialLinksSchema,
        joinPolicy: z.enum(JOIN_POLICIES, { error: 'required' }),
        visibility: z.enum(VISIBILITIES, { error: 'required' }),
        memberListVisibility: z.enum(MEMBER_LIST_VISIBILITIES, {
            error: 'required',
        }),
    })
    .superRefine((input, ctx) => {
        if (
            input.reach === 'local' &&
            !RADIUS_MILES.includes(input.radiusMiles as never)
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['radiusMiles'],
                message: 'radiusRequired',
            });
        }
    })
    .transform((input, ctx) => {
        // Numbers typed without a country code are read in the group's country.
        const phone = normalizePhone(input.phone ?? '', input.country);
        if (phone === null) {
            ctx.addIssue({
                code: 'custom',
                path: ['phone'],
                message: 'invalidPhone',
            });
            return z.NEVER;
        }
        return { ...input, phone };
    });

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type OrganizationField = keyof OrganizationInput;

export interface CreateOrganizationState {
    fieldErrors?: Partial<Record<OrganizationField, OrganizationErrorKey>>;
    formError?: OrganizationErrorKey;
    /** Echoed back so the form keeps what was typed. */
    values?: Partial<{
        name: string;
        handle: string;
        focusAreas: string[];
        description: string;
        reach: string;
        radiusMiles: string;
        streetAddress: string;
        languages: string[];
        website: string;
        contactEmail: string;
        phone: string;
        foundedYear: string;
        socials: { platform: string; handle: string }[];
        joinPolicy: string;
        visibility: string;
        memberListVisibility: string;
        /** Super users: add it as an unclaimed organization. */
        unclaimed: boolean;
    }>;
}

/** Reads the create form into the shape the schema expects. */
export function organizationFormValues(formData: FormData) {
    const text = (key: string) => {
        const value = formData.get(key);
        return typeof value === 'string' ? value : '';
    };
    return {
        name: text('name'),
        handle: text('handle'),
        focusAreas: formData.getAll('focusAreas').map(String),
        description: text('description'),
        country: text('country'),
        placeId: text('placeId'),
        streetAddress: text('streetAddress'),
        reach: text('reach'),
        radiusMiles: text('radiusMiles'),
        languages: formData.getAll('languages').map(String),
        website: text('website'),
        contactEmail: text('contactEmail'),
        phone: text('phone'),
        foundedYear: text('foundedYear'),
        socials: socialFormValues(formData),
        joinPolicy: text('joinPolicy'),
        visibility: text('visibility'),
        memberListVisibility: text('memberListVisibility'),
    };
}
