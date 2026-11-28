import { createHash } from 'node:crypto';

import { isSetupComplete } from '@/lib/account-setup';
import { getSessionUser } from '@/lib/auth/session';
import {
    cursorOf,
    defaultLanguageFilter,
    DISCUSSION_ANCHOR,
    encodeCursor,
    type CommentTarget,
} from '@/lib/comments';
import { canModerate } from '@/lib/comments/access';
import { getCommentCounts, getComments } from '@/lib/comments/store';
import { viewsFor } from '@/lib/comments/views';
import { getUserProfile, getUserProfileFresh } from '@/lib/users';
import {
    DiscussionUnavailable,
    type DiscussionViewer,
} from '@/components/organisms/discussion';
import type { Locale } from '@/i18n/routing';

import { DiscussionClient } from './discussion-client';

// The discussion under a word or an organization
// (documentation/features/20-comments.md). Reads the session, so it streams
// in its own <Suspense> and the page never waits on it. The first page and
// the count are cached; what the viewer voted for is read fresh. The page
// decides whether there's a discussion at all (organizations: listed and
// active only); the API and actions check again.

export async function DiscussionContainer({
    target,
    href,
    locale,
    organization,
}: {
    target: CommentTarget;
    /** The page it's on (no locale): sign-in and sign-up come back here. */
    href: string;
    locale: Locale;
    /**
     * On an organization's page: its name, for its replies, and whether the
     * viewer writes them (owners and moderators; super users on an unclaimed
     * page). Only shows the buttons: the server checks the role fresh.
     */
    organization?: { name: string; replier: boolean; unclaimed: boolean };
}) {
    const user = await getSessionUser();
    const uid = user?.uid ?? null;
    const moderator = canModerate(target, uid);
    // Words: readers start in their language, moderators with all.
    // Organizations: all.
    const language = defaultLanguageFilter(locale, moderator, target.kind);
    // The discussion fails on its own: a read that fails (say, an index
    // still building after a deploy) never takes the page with it.
    let loaded;
    try {
        const [page, counts] = await Promise.all([
            getComments(target, 'top', null, language),
            getCommentCounts(target),
        ]);
        const comments = await viewsFor(target, page.comments, {
            uid,
            moderator,
        });
        loaded = { page, counts, comments };
    } catch (error) {
        console.error(
            '[comments] loading the discussion failed',
            (error as Error).message
        );
        return <DiscussionUnavailable />;
    }
    const { page, counts, comments } = loaded;
    const last = page.comments.at(-1);
    const viewer = await viewerOf(
        href,
        uid,
        moderator,
        organization?.replier ?? false
    );
    return (
        <DiscussionClient
            // Next keeps recently visited pages alive with their state. A new
            // key per viewer starts the list fresh after signing in or out, so
            // nobody sees another viewer's votes or buttons. Hashed: the uid
            // itself never reaches the page.
            key={`${viewer.status}:${uid ? createHash('sha256').update(uid).digest('hex').slice(0, 16) : ''}`}
            target={target}
            viewer={viewer}
            initial={{
                comments,
                next: page.more && last ? encodeCursor(cursorOf(last)) : null,
            }}
            counts={counts}
            language={language}
            defaultLang={locale}
            organizationName={organization?.name}
            replyAsTeam={organization?.unclaimed}
        />
    );
}

async function viewerOf(
    href: string,
    uid: string | null,
    moderator: boolean,
    replier: boolean
): Promise<DiscussionViewer> {
    // Sign-up, sign-in and setup all come back to the discussion.
    const next = encodeURIComponent(`${href}#${DISCUSSION_ANCHOR}`);
    if (!uid)
        return {
            status: 'signedOut',
            signUpHref: `/sign-up?next=${next}`,
            signInHref: `/sign-in?next=${next}`,
        };
    let profile = await getUserProfile(uid);
    if (!isSetupComplete(profile)) profile = await getUserProfileFresh(uid);
    if (!isSetupComplete(profile))
        return {
            status: 'setupNeeded',
            setupHref: `/account/setup?next=${next}`,
        };
    return { status: 'ready', moderator, replier };
}
