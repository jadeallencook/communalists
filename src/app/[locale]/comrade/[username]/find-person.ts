import 'server-only';

import { handleProblem } from '@/lib/organizations/handle';
import { getUidByUsername, getUserProfile } from '@/lib/users';

/**
 * The person at /comrade/{username} (lowercased), or `person: null` if
 * there's no one there with a finished profile. Cached reads.
 */
export async function findPerson(raw: string) {
    const username = decodeURIComponent(raw).toLowerCase();
    if (handleProblem(username)) return { username, uid: null, person: null };
    const uid = await getUidByUsername(username);
    const person = uid ? await getUserProfile(uid) : null;
    return {
        username,
        uid,
        person:
            person?.displayName && person.username === username ? person : null,
    };
}
