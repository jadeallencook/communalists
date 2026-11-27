'use client';

import { BookOpenIcon, ClockIcon, PlusIcon, UploadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/atoms/dialog';
import { Skeleton } from '@/components/atoms/skeleton';
import {
    AdminActivity,
    type AdminActivityProps,
    type AdminLogItem,
} from '@/components/organisms/admin-activity';
import {
    AdminAnalytics,
    type AdminAnalyticsProps,
} from '@/components/organisms/admin-analytics';
import {
    AdminOrganizations,
    type AdminOrganizationsProps,
} from '@/components/organisms/admin-organizations';
import {
    AdminOverview,
    type AdminOverviewProps,
} from '@/components/organisms/admin-overview';
import { Link } from '@/i18n/navigation';
import type { ClaimIntent } from '@/lib/organizations/claims';
import { CLAIM_OVERDUE_DAYS } from '@/lib/platform-stats';

export type { AdminLogItem };

export interface AdminClaim {
    orgId: string;
    uid: string;
    orgName: string;
    handle: string;
    intent: ClaimIntent;
    role: string;
    message: string;
    claimantName: string;
    /** For linking to /comrade/{username}. */
    claimantUsername?: string;
    /** Their account email, so the team can follow up. Super users only. */
    claimantEmail?: string;
    /** Already formatted. */
    requestedOn: string;
    /** Whole days since it was sent. */
    daysWaiting: number;
}

export interface AdminDeleted {
    orgId: string;
    name: string;
    /** Already formatted. */
    deletedOn: string;
    restoreUntil: string;
}

export interface AdminPageProps {
    /** When the numbers were counted, already formatted. */
    asOf: string;
    claims: AdminClaim[];
    overview: AdminOverviewProps;
    /** From Umami. */
    analytics: AdminAnalyticsProps;
    organizations: AdminOrganizationsProps;
    activity: AdminActivityProps;
    /** Deleted in the last 30 days: restorable. */
    deleted: AdminDeleted[];
    /** How many words the dictionary has. */
    definitionCount: number;
    /** UI locale, sent so redirects stay in it. */
    locale: string;
    /** In the app, decideClaimAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Already translated. */
    error?: string;
    notice?: string;
    /** Changes on every result, so focus moves to it each time. */
    resultKey?: number;
    /** In the app, restoreOrganizationAction via useActionState. */
    restoreAction: (formData: FormData) => void;
    restorePending?: boolean;
    /** Already translated; shown in the Recently deleted section. */
    restoreError?: string;
    restoreNotice?: string;
    restoreKey?: number;
}

const SECTIONS = [
    'attention',
    'overview',
    'trends',
    'analytics',
    'organizations',
    'dictionary',
    'activity',
    'deleted',
] as const;

/**
 * /admin, the super-user dashboard: what needs attention (claim requests,
 * pages nobody can be reached through), the numbers and trends, the
 * organization and dictionary tools, what super users did, and what can
 * still be restored.
 */
export function AdminPage({
    asOf,
    claims,
    overview,
    analytics,
    organizations,
    activity,
    definitionCount,
    locale,
    formAction,
    pending = false,
    error,
    notice,
    resultKey,
    deleted,
    restoreAction,
    restorePending = false,
    restoreError,
    restoreNotice,
    restoreKey,
}: AdminPageProps) {
    const t = useTranslations('Admin');
    // The decided request disappears; put focus on the result instead of
    // letting it fall to the top of the page.
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (resultKey) resultRef.current?.focus();
    }, [resultKey]);
    const restoreRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (restoreKey) restoreRef.current?.focus();
    }, [restoreKey]);

    const hidden = (claim: AdminClaim, decision: 'approve' | 'deny') => (
        <>
            <input type="hidden" name="orgId" value={claim.orgId} />
            <input type="hidden" name="uid" value={claim.uid} />
            <input type="hidden" name="decision" value={decision} />
            <input type="hidden" name="locale" value={locale} />
        </>
    );

    const unreachable = organizations.gapCounts.contact;

    return (
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
                <p className="text-sm text-muted-foreground">
                    {t('asOf', { time: asOf })}
                </p>
                <nav aria-label={t('onThisPage')} className="mt-2">
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {SECTIONS.map((id) => (
                            <li key={id}>
                                <a
                                    href={`#admin-${id}`}
                                    className="underline underline-offset-2"
                                >
                                    {t(`sections.${id}`)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <section
                aria-labelledby="admin-attention"
                className="flex flex-col gap-6"
            >
                <h2
                    id="admin-attention"
                    className="font-heading text-xl font-semibold"
                >
                    {t('sections.attention')}
                </h2>
                {unreachable > 0 ? (
                    <p className="rounded-lg border p-4 text-sm">
                        {t('attentionGaps', { count: unreachable })}{' '}
                        <Link
                            href={{
                                pathname: '/admin',
                                query: { gap: 'contact' },
                                hash: 'gaps',
                            }}
                            className="underline underline-offset-2"
                        >
                            {t('attentionGapsLink')}
                        </Link>
                    </p>
                ) : (
                    claims.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            {t('attentionClear')}
                        </p>
                    )
                )}
                <section
                    aria-labelledby="admin-claims"
                    className="flex flex-col gap-3"
                >
                    <h3
                        id="admin-claims"
                        className="font-heading text-lg font-semibold"
                    >
                        {t('claimsTitle')}{' '}
                        <span className="ml-1 text-base font-normal text-muted-foreground">
                            {claims.length}
                        </span>
                    </h3>
                    <p className="-mt-1 text-sm text-muted-foreground">
                        {t('claimsHint')}
                    </p>
                    <div ref={resultRef} tabIndex={-1} className="outline-none">
                        {notice && (
                            <p role="status" className="text-sm">
                                {notice}
                            </p>
                        )}
                        {error && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                    {claims.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                            {t('noClaims')}
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {claims.map((claim) => (
                                <li
                                    key={`${claim.orgId}_${claim.uid}`}
                                    className="flex flex-col gap-3 rounded-lg border p-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="font-medium">
                                            {t(`intents.${claim.intent}`, {
                                                name: claim.claimantName,
                                                org: claim.orgName,
                                            })}
                                        </p>
                                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                                            <span>
                                                {t('requestedOn', {
                                                    date: claim.requestedOn,
                                                })}
                                                {/* "Sent {date}" already covers today. */}
                                                {claim.daysWaiting > 0 &&
                                                    ` · ${t('waiting', {
                                                        days: claim.daysWaiting,
                                                    })}`}
                                            </span>
                                            {claim.daysWaiting >=
                                                CLAIM_OVERDUE_DAYS && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-foreground px-2 py-0.5 text-xs font-medium text-foreground">
                                                    <ClockIcon
                                                        aria-hidden
                                                        className="size-3.5"
                                                    />
                                                    {t('overdue', {
                                                        days: CLAIM_OVERDUE_DAYS,
                                                    })}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <dl className="grid gap-x-4 gap-y-1 text-sm md:grid-cols-[auto_1fr]">
                                        <dt className="text-muted-foreground">
                                            {t('role')}
                                        </dt>
                                        <dd className="break-words">
                                            {claim.role}
                                        </dd>
                                        <dt className="text-muted-foreground">
                                            {t('howToCheck')}
                                        </dt>
                                        <dd className="break-words whitespace-pre-line">
                                            {claim.message}
                                        </dd>
                                        {claim.claimantEmail && (
                                            <>
                                                <dt className="text-muted-foreground">
                                                    {t('email')}
                                                </dt>
                                                <dd className="break-all">
                                                    <a
                                                        href={`mailto:${claim.claimantEmail}`}
                                                        className="underline underline-offset-2"
                                                    >
                                                        {claim.claimantEmail}
                                                    </a>
                                                </dd>
                                            </>
                                        )}
                                    </dl>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Link href={`/org/${claim.handle}`}>
                                                {t('viewOrganization', {
                                                    org: claim.orgName,
                                                })}
                                            </Link>
                                        </Button>
                                        {claim.claimantUsername && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Link
                                                    href={`/comrade/${claim.claimantUsername}`}
                                                >
                                                    {t('viewProfile', {
                                                        name: claim.claimantName,
                                                    })}
                                                </Link>
                                            </Button>
                                        )}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        claim.intent ===
                                                        'remove'
                                                            ? 'destructive'
                                                            : 'default'
                                                    }
                                                    aria-label={t('actionFor', {
                                                        action: t(
                                                            `approve.${claim.intent}.button`
                                                        ),
                                                        name: claim.claimantName,
                                                        org: claim.orgName,
                                                    })}
                                                >
                                                    {t(
                                                        `approve.${claim.intent}.button`
                                                    )}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <form
                                                    action={formAction}
                                                    className="contents"
                                                >
                                                    {hidden(claim, 'approve')}
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            {t(
                                                                `approve.${claim.intent}.title`,
                                                                {
                                                                    name: claim.claimantName,
                                                                    org: claim.orgName,
                                                                }
                                                            )}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            {t(
                                                                `approve.${claim.intent}.body`,
                                                                {
                                                                    name: claim.claimantName,
                                                                    org: claim.orgName,
                                                                }
                                                            )}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                            >
                                                                {t('keep')}
                                                            </Button>
                                                        </DialogClose>
                                                        <Button
                                                            type="submit"
                                                            variant={
                                                                claim.intent ===
                                                                'remove'
                                                                    ? 'destructive'
                                                                    : 'default'
                                                            }
                                                            disabled={pending}
                                                        >
                                                            {t(
                                                                `approve.${claim.intent}.confirm`
                                                            )}
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                        <form action={formAction}>
                                            {hidden(claim, 'deny')}
                                            <Button
                                                type="submit"
                                                size="sm"
                                                variant="outline"
                                                disabled={pending}
                                                aria-label={t('actionFor', {
                                                    action: t('deny'),
                                                    name: claim.claimantName,
                                                    org: claim.orgName,
                                                })}
                                            >
                                                {t('deny')}
                                            </Button>
                                        </form>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </section>

            <AdminOverview {...overview} />

            <AdminAnalytics {...analytics} />

            <AdminOrganizations {...organizations} />

            <section
                aria-labelledby="admin-dictionary"
                className="flex flex-col gap-3"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="admin-dictionary"
                        className="font-heading text-xl font-semibold"
                    >
                        {t('dictionaryTitle')}{' '}
                        <span className="ml-1 text-base font-normal text-muted-foreground">
                            {t('wordCount', { count: definitionCount })}
                        </span>
                    </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href="/admin/definitions/new">
                            <PlusIcon aria-hidden />
                            {t('addWord')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/definitions/import">
                            <UploadIcon aria-hidden />
                            {t('importWords')}
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/definitions">
                            <BookOpenIcon aria-hidden />
                            {t('manageDictionary')}
                        </Link>
                    </Button>
                </div>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('dictionaryHint')}
                </p>
            </section>

            <AdminActivity {...activity} />

            <section
                aria-labelledby="admin-deleted"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-deleted"
                    className="font-heading text-xl font-semibold"
                >
                    {t('deletedTitle')}{' '}
                    <span className="ml-1 text-base font-normal text-muted-foreground">
                        {deleted.length}
                    </span>
                </h2>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('deletedHint')}
                </p>
                <div ref={restoreRef} tabIndex={-1} className="outline-none">
                    {restoreNotice && (
                        <p role="status" className="text-sm">
                            {restoreNotice}
                        </p>
                    )}
                    {restoreError && (
                        <p role="alert" className="text-sm text-destructive">
                            {restoreError}
                        </p>
                    )}
                </div>
                {deleted.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('noDeleted')}
                    </p>
                ) : (
                    <ul className="flex flex-col divide-y rounded-lg border">
                        {deleted.map((org) => (
                            <li
                                key={org.orgId}
                                className="flex flex-col gap-2 p-3 md:flex-row md:items-center md:justify-between"
                            >
                                <span className="flex flex-col">
                                    <span className="font-medium break-words">
                                        {org.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {t('deletedOn', {
                                            date: org.deletedOn,
                                            until: org.restoreUntil,
                                        })}
                                    </span>
                                </span>
                                <form action={restoreAction}>
                                    <input
                                        type="hidden"
                                        name="orgId"
                                        value={org.orgId}
                                    />
                                    <input
                                        type="hidden"
                                        name="locale"
                                        value={locale}
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="outline"
                                        disabled={restorePending}
                                        aria-label={t('restoreFor', {
                                            name: org.name,
                                        })}
                                    >
                                        {t('restore')}
                                    </Button>
                                </form>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}

/** Shown while the page loads. */
export function AdminPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
        </section>
    );
}
