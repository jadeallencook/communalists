// Which public details an organization's page is missing, stored on each
// organization as `missingDetails` so super users can count and list the
// unclaimed pages that need research (documentation/features/18-unclaimed-organizations.md).
//
// Plain TypeScript with no imports: scripts/seed.mjs and
// scripts/backfill-missing-details.mjs import it directly (Node strips the types).

/**
 * The gaps, as permanent keys. `contact` means there's no way to reach the
 * group at all (no phone, email, website or social link): the most urgent.
 */
export const DETAIL_GAPS = [
    'contact',
    'phone',
    'email',
    'website',
    'address',
] as const;

export type DetailGap = (typeof DETAIL_GAPS)[number];

export interface OrganizationDetails {
    phone?: string | null;
    contactEmail?: string | null;
    website?: string | null;
    streetAddress?: string | null;
    socials?: readonly unknown[] | null;
}

const blank = (value: string | null | undefined) => !value || !value.trim();

/** The gaps in an organization's details, in DETAIL_GAPS order. */
export function missingDetails(details: OrganizationDetails): DetailGap[] {
    const phone = blank(details.phone);
    const email = blank(details.contactEmail);
    const website = blank(details.website);
    const socials = !details.socials || details.socials.length === 0;
    const gaps: DetailGap[] = [];
    if (phone && email && website && socials) gaps.push('contact');
    if (phone) gaps.push('phone');
    if (email) gaps.push('email');
    if (website) gaps.push('website');
    if (blank(details.streetAddress)) gaps.push('address');
    return gaps;
}

/** Whether a value read from a URL or form is one of the gaps. */
export function isDetailGap(value: unknown): value is DetailGap {
    return (
        typeof value === 'string' &&
        (DETAIL_GAPS as readonly string[]).includes(value)
    );
}

/** Whether the stored list differs from what the details say (for the backfill). */
export function missingDetailsChanged(
    stored: unknown,
    details: OrganizationDetails
): boolean {
    const next = missingDetails(details);
    return (
        !Array.isArray(stored) ||
        stored.length !== next.length ||
        stored.some((gap, i) => gap !== next[i])
    );
}
