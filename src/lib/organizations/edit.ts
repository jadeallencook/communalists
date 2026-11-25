// Editing an organization: which fields changed, for the moderation log and
// for deciding whether membership copies need updating. Pure.

/** Fields an edit can change, in form order. Stored in the moderation log. */
export const ORG_EDIT_FIELDS = [
    'name',
    'handle',
    'focusAreas',
    'description',
    'foundedYear',
    'location',
    'streetAddress',
    'reach',
    'languages',
    'website',
    'contactEmail',
    'phone',
    'socials',
    'joinPolicy',
    'visibility',
    'memberListVisibility',
] as const;
export type OrgEditField = (typeof ORG_EDIT_FIELDS)[number];

/** Fields copied onto every membership (`org { name, handle, focusAreas }`). */
export const COPIED_FIELDS: readonly OrgEditField[] = [
    'name',
    'handle',
    'focusAreas',
];

const same = (a: unknown, b: unknown) =>
    JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** The fields whose values differ, in form order. */
export function changedFields(
    before: Partial<Record<OrgEditField, unknown>>,
    after: Partial<Record<OrgEditField, unknown>>
): OrgEditField[] {
    return ORG_EDIT_FIELDS.filter(
        (field) => !same(before[field], after[field])
    );
}
