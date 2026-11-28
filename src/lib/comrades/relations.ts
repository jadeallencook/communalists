import 'server-only';

import { getMemberships } from '@/lib/organizations';
import {
    profileViewer,
    type ProfileViewer,
    type ProfileVisibility,
} from '@/lib/profiles';

import { getComradeUids } from './store';

/**
 * How one viewer relates to several people (self, comrade, groupmate,
 * signed-in stranger, or signed out), for deciding whose details and
 * photos they see. The viewer's groups and comrades are read once; another
 * person's groups only when it matters (they share with "my groups" and
 * aren't a comrade). All reads are cached. Pass `null` when signed out.
 *
 * A failed read counts as "not related", so a section shows less, never
 * more (decision #68).
 */
export function relationResolver(viewerUid: string | null) {
    let mine: Promise<{ orgs: Set<string>; comrades: Set<string> }> | null =
        null;
    const viewerSide = () =>
        (mine ??= viewerUid
            ? Promise.all([
                  getMemberships(viewerUid)
                      .then((list) => new Set(list.map((m) => m.orgId)))
                      .catch(() => new Set<string>()),
                  getComradeUids(viewerUid).catch(() => new Set<string>()),
              ]).then(([orgs, comrades]) => ({ orgs, comrades }))
            : Promise.resolve({ orgs: new Set(), comrades: new Set() }));

    /** How the viewer relates to `uid`, whose profile has `visibility`. */
    return async function relationTo(
        uid: string,
        visibility: ProfileVisibility
    ): Promise<ProfileViewer> {
        if (!viewerUid) return 'public';
        if (uid === viewerUid) return 'self';
        const { orgs, comrades } = await viewerSide();
        if (comrades.has(uid)) return 'comrade';
        const sharesGroup =
            visibility === 'groups' && orgs.size > 0
                ? await getMemberships(uid)
                      .then((list) => list.some((m) => orgs.has(m.orgId)))
                      .catch(() => false)
                : false;
        return profileViewer({ isSelf: false, signedIn: true, sharesGroup });
    };
}

/** relationResolver for a list of people at once, as a map by uid. */
export async function relationsTo(
    viewerUid: string | null,
    people: { uid: string; visibility: ProfileVisibility }[]
): Promise<Map<string, ProfileViewer>> {
    const relationTo = relationResolver(viewerUid);
    const entries = await Promise.all(
        people.map(
            async (p) => [p.uid, await relationTo(p.uid, p.visibility)] as const
        )
    );
    return new Map(entries);
}
