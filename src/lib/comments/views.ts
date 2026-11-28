import 'server-only';

import { relationResolver } from '@/lib/comrades/relations';
import { visiblePhoto } from '@/lib/profiles';
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
    // Reads the viewer's groups and comrades only when an author's photo
    // depends on them (src/lib/comrades/relations.ts).
    const relationTo = relationResolver(viewerUid);
    await Promise.all(
        [...new Set(uids)].map(async (uid) => {
            const profile = await getUserProfile(uid);
            if (!profile?.displayName) return;
            const visibility = profile.profile.visibility;
            // A photo is extra: if the relation can't be read, leave it out.
            const photo =
                profile.photo && visibility !== 'public'
                    ? visiblePhoto(
                          profile.photo.small,
                          visibility,
                          await relationTo(uid, visibility).catch(
                              () => 'signedIn' as const
                          )
                      )
                    : profile.photo?.small;
            authors.set(uid, {
                name: profile.displayName,
                ...(profile.username ? { username: profile.username } : {}),
                ...(photo ? { photo } : {}),
            });
        })
    );
    return authors;
}
