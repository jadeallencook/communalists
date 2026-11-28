'use server';

import { z } from 'zod';

import { getSessionUser } from '@/lib/auth/session';
import { getMemberships, getOrganizationByHandle } from '@/lib/organizations';
import { organizationPath } from '@/lib/paths';
import { getSiteUrl } from '@/lib/site';

// "Fill in from your organization" on /graphics (decision #75): an
// organization's public details for a member's graphic. Everything returned
// is already public on the organization's page; the membership check only
// keeps the list to the person's own groups. The logo comes back as a data
// URL, so the browser can draw it on a canvas without cross-origin rules.

export interface GraphicOrganization {
    name: string;
    /** Its page, for the QR code. */
    link: string;
    /** Where people go, if it has one. */
    place?: string;
    /** The logo as a `data:` URL. */
    logo?: string;
}

export type GraphicOrganizationResult =
    { ok: true; organization: GraphicOrganization } | { ok: false };

const handleSchema = z.string().trim().min(1).max(64);

/** Largest logo we pass along (saved logos are ~20–80 KB WebP). */
const MAX_LOGO_BYTES = 1024 * 1024;

async function logoDataUrl(url: string): Promise<string | undefined> {
    try {
        const response = await fetch(url, {
            signal: AbortSignal.timeout(5000),
        });
        const type = response.headers.get('content-type') ?? '';
        if (!response.ok || !type.startsWith('image/')) return undefined;
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length > MAX_LOGO_BYTES) return undefined;
        return `data:${type};base64,${bytes.toString('base64')}`;
    } catch (error) {
        // The rest still fills in without the logo.
        console.error('[graphics] logo read failed', (error as Error).message);
        return undefined;
    }
}

export async function graphicOrganizationAction(
    handle: string
): Promise<GraphicOrganizationResult> {
    const parsed = handleSchema.safeParse(handle);
    if (!parsed.success) return { ok: false };
    const user = await getSessionUser();
    if (!user) return { ok: false };
    try {
        const memberships = await getMemberships(user.uid);
        const member = memberships.some(
            (m) => m.org.handle === parsed.data && m.status === 'active'
        );
        if (!member) return { ok: false };
        const org = await getOrganizationByHandle(parsed.data);
        if (!org || org.status !== 'active') return { ok: false };
        return {
            ok: true,
            organization: {
                name: org.name,
                link: `${getSiteUrl()}${organizationPath(org.handle)}`,
                place: org.streetAddress || undefined,
                logo: org.photo
                    ? await logoDataUrl(org.photo.large)
                    : undefined,
            },
        };
    } catch (error) {
        console.error('[graphics] fill failed', (error as Error).message);
        return { ok: false };
    }
}
