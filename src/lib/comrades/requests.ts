import 'server-only';

import { visiblePhoto } from '@/lib/profiles';
import { getUserProfile } from '@/lib/users';

import { receivedRequests } from '.';
import { relationsTo } from './relations';
import { getComradeships } from './store';

/**
 * Requests waiting for this person's answer, newest first, with each
 * sender's name, username and (if this person may see it) photo. Senders
 * whose account is gone drop out. Cached reads.
 */
export async function getReceivedRequests(uid: string) {
    const waiting = receivedRequests(uid, await getComradeships(uid));
    const senders = await Promise.all(
        waiting.map((p) => getUserProfile(p.other))
    );
    const found = waiting.flatMap((p, i) => {
        const s = senders[i];
        return s?.displayName && s.username ? [{ pair: p, sender: s }] : [];
    });
    const relations = await relationsTo(
        uid,
        found.map(({ pair, sender }) => ({
            uid: pair.other,
            visibility: sender.profile.visibility,
        }))
    );
    return found.map(({ pair, sender }) => ({
        uid: pair.other,
        name: sender.displayName!,
        username: sender.username!,
        photo: visiblePhoto(
            sender.photo?.small,
            sender.profile.visibility,
            relations.get(pair.other) ?? 'signedIn'
        ),
        at: pair.createdAt,
    }));
}
