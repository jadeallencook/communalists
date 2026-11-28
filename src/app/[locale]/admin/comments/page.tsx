import type { Metadata } from 'next';
import { getFormatter, getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminCommentsPageLoading } from '@/components/pages/admin-comments-page';
import { requirePlatformAdmin } from '@/lib/auth/platform-admin';
import {
    definitionHref,
    reportId,
    tallyReasons,
    type CommentTarget,
} from '@/lib/comments';
import { getCommentFresh, getOpenReports } from '@/lib/comments/store';
import { localize } from '@/lib/definitions';
import { getDefinition } from '@/lib/definitions/store';
import { getOrganizationById } from '@/lib/organizations';
import { organizationPath } from '@/lib/paths';
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
    const [reports, locale, format, t] = await Promise.all([
        getOpenReports(),
        getLocale(),
        getFormatter(),
        getTranslations('Discussion'),
    ]);
    // Reports are few; each comment is read fresh so moderators act on what's there now.
    const items = await Promise.all(
        reports.map(async (report) => {
            const [comment, on] = await Promise.all([
                getCommentFresh(report.target, report.commentId),
                targetLabel(report.target, locale),
            ]);
            const profile = comment ? await getUserProfile(comment.uid) : null;
            const author = profile?.displayName ?? null;
            // A reported reply: its text and date, shown as from the
            // organization (never who wrote it), and whose comment it answers.
            const reply = report.part === 'reply' ? comment?.reply : undefined;
            const shown = report.part === 'reply' ? (reply ?? null) : comment;
            return {
                key: reportId(report.target, report.commentId, report.part),
                target: report.target,
                commentId: report.commentId,
                part: report.part,
                on,
                ...(report.part === 'reply'
                    ? {
                          reply: {
                              from: reply?.byTeam ? t('teamName') : on.label,
                              to: author ?? t('formerMember'),
                          },
                      }
                    : {}),
                text: shown?.text ?? null,
                lang: shown?.lang ?? 'en',
                author,
                postedOn: shown
                    ? format.dateTime(new Date(shown.at), {
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
                href: definitionHref(target.id),
            };
        }
        case 'organization': {
            // The name as the group wrote it; its language isn't known.
            const org = await getOrganizationById(target.id);
            return {
                label: org?.name ?? target.id,
                lang: '',
                href: org ? organizationPath(org.handle) : '/admin',
            };
        }
    }
}
