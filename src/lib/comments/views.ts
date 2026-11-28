import 'server-only';

import { getMemberships } from '@/lib/organizations';
import { profileViewer, visiblePhoto } from '@/lib/profiles';
import { getUserProfile } from '@/lib/users';

import {
    commentView,
    type CommentTarget,
    type CommentView,
    type StoredComment,
    type Viewer,
} from './index';
import { getVotedIds } from './store';

/**
 * Comments as one viewer may see them. Authors are read through the cached
 * profile (`user:{uid}`), so a changed name shows everywhere and a page of
 * comments costs a read only for authors not seen lately. Only the name,
 * username and (as their visibility allows this viewer) photo link leave the
 * server: never the uid or anything else on the profile.
 */
export async function viewsFor(
    target: CommentTarget,
    stored: readonly StoredComment[],
    viewer: Viewer,
    voted?: ReadonlySet<string>
): Promise<CommentView[]> {
    const [authors, votedIds] = await Promise.all([
        authorsOf(
            stored.map((c) => c.uid),
            viewer.uid
        ),
        voted ??
            (viewer.uid && stored.length
                ? getVotedIds(target, viewer.uid)
                : new Set<string>()),
    ]);
    return stored.map((comment) =>
        commentView(comment, authors.get(comment.uid) ?? null, viewer, votedIds)
    );
}

async function authorsOf(uids: string[], viewerUid: string | null) {
    const authors = new Map<string, CommentView['author']>();
    // The viewer's groups, read only if an author shares with groups only.
    let viewerGroups: Promise<Set<string>> | null = null;
    const sharesGroup = async (uid: string) => {
        if (!viewerUid) return false;
        viewerGroups ??= getMemberships(viewerUid).then(
            (list) => new Set(list.map((m) => m.orgId))
        );
        const [mine, theirs] = await Promise.all([
            viewerGroups,
            getMemberships(uid),
        ]);
        return theirs.some((m) => mine.has(m.orgId));
    };
    await Promise.all(
        [...new Set(uids)].map(async (uid) => {
            const profile = await getUserProfile(uid);
            if (!profile?.displayName) return;
            const visibility = profile.profile.visibility;
            let photo: string | undefined;
            if (profile.photo) {
                // A photo is extra: if groups can't be read, leave it out.
                const shares =
                    visibility === 'groups' && uid !== viewerUid
                        ? await sharesGroup(uid).catch(() => false)
                        : false;
                photo = visiblePhoto(
                    profile.photo.small,
                    visibility,
                    profileViewer({
                        isSelf: uid === viewerUid,
                        signedIn: !!viewerUid,
                        sharesGroup: shares,
                    })
                );
            }
            authors.set(uid, {
                name: profile.displayName,
                ...(profile.username ? { username: profile.username } : {}),
                ...(photo ? { photo } : {}),
            });
        })
    );
    return authors;
}
