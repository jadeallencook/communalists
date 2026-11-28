import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';
import { seesDetails } from '@/lib/profiles';
import { getUidByUsername, getUserProfile } from '@/lib/users';

import { fallbackCard, photoForCard, shareCard } from '../../card';

// GET /api/share-cards/person/{username}?v=… → the link-preview image for a
// profile (decision #72). Apps fetch it signed out, so it shows only what a
// signed-out visitor sees: the photo only for public profiles, initials
// otherwise. `v` only makes a changed card a new link (the page sets it).
export async function GET(
    _request: Request,
    { params }: RouteContext<'/api/share-cards/person/[username]'>
) {
    const username = normalizeHandle((await params).username);
    if (handleProblem(username)) return new Response(null, { status: 404 });
    try {
        const uid = await getUidByUsername(username);
        const person = uid ? await getUserProfile(uid) : null;
        if (!uid || !person?.displayName || person.username !== username)
            return new Response(null, { status: 404 });
        const showPhoto =
            person.photo && seesDetails(person.profile.visibility, 'public');
        return await shareCard({
            name: person.displayName,
            detail: `@${username}`,
            photo: showPhoto
                ? await photoForCard('users', uid, person.photo!)
                : undefined,
            shape: 'round',
        });
    } catch (error) {
        return fallbackCard(error);
    }
}
