import 'server-only';

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
 * comments costs a read only for authors not seen lately. Only the name and
 * username leave the server: never the uid or anything else on the profile.
 */
export async function viewsFor(
    target: CommentTarget,
    stored: readonly StoredComment[],
    viewer: Viewer,
    voted?: ReadonlySet<string>
): Promise<CommentView[]> {
    const [authors, votedIds] = await Promise.all([
        authorsOf(stored.map((c) => c.uid)),
        voted ??
            (viewer.uid && stored.length
                ? getVotedIds(target, viewer.uid)
                : new Set<string>()),
    ]);
    return stored.map((comment) =>
        commentView(comment, authors.get(comment.uid) ?? null, viewer, votedIds)
    );
}

async function authorsOf(uids: string[]) {
    const authors = new Map<string, CommentView['author']>();
    await Promise.all(
        [...new Set(uids)].map(async (uid) => {
            const profile = await getUserProfile(uid);
            if (profile?.displayName)
                authors.set(uid, {
                    name: profile.displayName,
                    ...(profile.username ? { username: profile.username } : {}),
                });
        })
    );
    return authors;
}
