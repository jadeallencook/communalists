import { getOrganizationByHandle } from '@/lib/organizations';
import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';

import { fallbackCard, photoForCard, shareCard } from '../../card';

// GET /api/share-cards/organization/{handle}?v=… → the link-preview image for
// an organization's page (decision #72): its logo or initials, name and
// city, all public on the page already. `v` only makes a changed card a new
// link.
export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/share-cards/organization/[handle]'>
) {
    const handle = normalizeHandle((await params).handle);
    if (handleProblem(handle)) return new Response(null, { status: 404 });
    try {
        const org = await getOrganizationByHandle(handle);
        if (!org) return new Response(null, { status: 404 });
        return await shareCard({
            name: org.name,
            detail: org.location.label,
            photo: org.photo
                ? await photoForCard('organizations', org.id, org.photo)
                : undefined,
            shape: 'square',
        });
    } catch (error) {
        return fallbackCard(error);
    }
}
