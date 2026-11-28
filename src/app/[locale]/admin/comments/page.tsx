import type { Metadata } from 'next';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminCommentsPageLoading } from '@/components/pages/admin-comments-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import {
    reportId,
    tallyReasons,
    targetHref,
    type CommentTarget,
} from '@/lib/comments';
import { getCommentFresh, getOpenReports } from '@/lib/comments/store';
import { localize } from '@/lib/definitions';
import { getDefinition } from '@/lib/definitions/store';
import { getUserProfile } from '@/lib/users';

import { AdminCommentsContainer } from './admin-comments-container';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AdminComments');
    return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

// Super users only; everyone else gets the not-found page
// (documentation/features/20-comments.md → Moderation).
export default function Page() {
    return (
        <Suspense fallback={<AdminCommentsPageLoading />}>
            <ReportsContainer />
        </Suspense>
    );
}

async function ReportsContainer() {
    await requirePlatformAdmin('/admin/comments');
    const [reports, locale, format] = await Promise.all([
        getOpenReports(),
        getLocale(),
        getFormatter(),
    ]);
    // Reports are few; each comment is read fresh so moderators act on what's there now.
    const items = await Promise.all(
        reports.map(async (report) => {
            const [comment, on] = await Promise.all([
                getCommentFresh(report.target, report.commentId),
                targetLabel(report.target, locale),
            ]);
            const profile = comment ? await getUserProfile(comment.uid) : null;
            return {
                key: reportId(report.target, report.commentId),
                target: report.target,
                commentId: report.commentId,
                on,
                text: comment?.text ?? null,
                lang: comment?.lang ?? 'en',
                author: profile?.displayName ?? null,
                postedOn: comment
                    ? format.dateTime(new Date(comment.at), {
                          dateStyle: 'medium',
                      })
                    : undefined,
                votes: comment?.votes ?? 0,
                reports: report.count,
                reasons: tallyReasons(report.reasons),
            };
        })
    );
    return <AdminCommentsContainer items={items} />;
}

async function targetLabel(target: CommentTarget, locale: string) {
    switch (target.kind) {
        case 'definition': {
            const definition = await getDefinition(target.id);
            const text = definition ? localize(definition, locale) : null;
            return {
                label: text?.word ?? target.id,
                lang: text?.lang ?? 'en',
                href: targetHref(target),
            };
        }
    }
}
