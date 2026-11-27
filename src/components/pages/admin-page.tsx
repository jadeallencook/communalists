'use client';

import { BookOpenIcon, PlusIcon, UploadIcon } from 'lucide-react';
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
    OrganizationCard,
    type OrganizationCardProps,
} from '@/components/molecules/organization-card';
import { Link } from '@/i18n/navigation';
import type { AdminAction, ClaimIntent } from '@/lib/organizations/claims';

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
}

export interface AdminLogItem {
    id: string;
    action: AdminAction;
    orgName: string;
    actorName: string;
    targetName?: string;
    /** A dictionary word, for word changes. */
    word?: string;
    /** Already formatted. */
    on: string;
}

export interface AdminDeleted {
    orgId: string;
    name: string;
    /** Already formatted. */
    deletedOn: string;
    restoreUntil: string;
}

export interface AdminPageProps {
    claims: AdminClaim[];
    unclaimed: OrganizationCardProps[];
    /** Deleted in the last 30 days: restorable. */
    deleted: AdminDeleted[];
    log: AdminLogItem[];
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

/**
 * /admin, for super users: requests to claim or take down unclaimed
 * organizations, the unclaimed organizations, the dictionary, and what
 * super users did.
 */
export function AdminPage({
    claims,
    unclaimed,
    log,
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

    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <header className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-semibold tracking-tight">
                    {t('title')}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro')}
                </p>
            </header>

            <section
                aria-labelledby="admin-claims"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-claims"
                    className="font-heading text-xl font-semibold"
                >
                    {t('claimsTitle')}
                    <span className="ml-2 text-base font-normal text-muted-foreground">
                        {claims.length}
                    </span>
                </h2>
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
                        <p role="alert" className="text-sm text-destructive">
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
                                    <p className="text-sm text-muted-foreground">
                                        {t('requestedOn', {
                                            date: claim.requestedOn,
                                        })}
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
                                    <Button asChild variant="outline" size="sm">
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
                                                    claim.intent === 'remove'
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

            <section
                aria-labelledby="admin-unclaimed"
                className="flex flex-col gap-3"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="admin-unclaimed"
                        className="font-heading text-xl font-semibold"
                    >
                        {t('unclaimedTitle')}
                        <span className="ml-2 text-base font-normal text-muted-foreground">
                            {unclaimed.length}
                        </span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href="/admin/import">
                                <UploadIcon aria-hidden />
                                {t('importUnclaimed')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={{
                                    pathname: '/org/new',
                                    query: { unclaimed: '1' },
                                }}
                            >
                                <PlusIcon aria-hidden />
                                {t('addUnclaimed')}
                            </Link>
                        </Button>
                    </div>
                </div>
                {unclaimed.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('noUnclaimed')}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {unclaimed.map((org) => (
                            <li key={org.handle}>
                                <OrganizationCard {...org} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section
                aria-labelledby="admin-dictionary"
                className="flex flex-col gap-3"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="admin-dictionary"
                        className="font-heading text-xl font-semibold"
                    >
                        {t('dictionaryTitle')}
                        <span className="ml-2 text-base font-normal text-muted-foreground">
                            {definitionCount}
                        </span>
                    </h2>
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

            <section
                aria-labelledby="admin-deleted"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-deleted"
                    className="font-heading text-xl font-semibold"
                >
                    {t('deletedTitle')}
                    <span className="ml-2 text-base font-normal text-muted-foreground">
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

            <section
                aria-labelledby="admin-log"
                className="flex flex-col gap-3"
            >
                <h2
                    id="admin-log"
                    className="font-heading text-xl font-semibold"
                >
                    {t('logTitle')}
                </h2>
                <p className="-mt-1 text-sm text-muted-foreground">
                    {t('logHint')}
                </p>
                {log.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        {t('noLog')}
                    </p>
                ) : (
                    <ol className="flex flex-col divide-y rounded-lg border">
                        {log.map((entry) => (
                            <li
                                key={entry.id}
                                className="flex flex-col gap-0.5 p-3 text-sm"
                            >
                                <span>
                                    {t(`log.${entry.action}`, {
                                        actor: entry.actorName,
                                        org: entry.orgName,
                                        target: entry.targetName ?? '',
                                        word: entry.word ?? '',
                                    })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {entry.on}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </section>
    );
}

/** Shown while the page loads. */
export function AdminPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
        </section>
    );
}
