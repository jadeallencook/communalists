// Comrades: two people who agreed to be connected, like friends (decision
// #74). One asks, the other accepts on their dashboard or in notifications.
// Comrades see each other's profile details whatever its visibility. Pure
// (no React, Next or Firebase). Design: documentation/features/21-comrades.md.

import { z } from 'zod';

import type { ComradeRequestSetting } from '../profiles';

/** At most this many requests waiting for an answer, per sender. */
export const MAX_PENDING_SENT = 50;
/** After a decline, the sender can't ask the same person again for this long. */
export const DECLINE_COOLDOWN_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `comradeships/{low}_{high}`: one document per pair, whoever asked, so a
 * pair can never have two. Uids are sorted, so either person finds it.
 */
export function pairId(a: string, b: string): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
}

export const COMRADESHIP_STATUSES = [
    'pending',
    'accepted',
    'declined',
] as const;
export type ComradeshipStatus = (typeof COMRADESHIP_STATUSES)[number];

/** A pair as one of the two people sees it. Times are epoch ms. */
export interface Comradeship {
    /** The other person. */
    other: string;
    /** Who asked. */
    from: string;
    status: ComradeshipStatus;
    createdAt: number;
    /** When it was accepted or declined. */
    respondedAt?: number;
    /** The sender took back a declined request (it stays, for the cooldown). */
    hiddenFromSender?: boolean;
}

/** Reads a stored pair for `uid`, or null if it's malformed or not theirs. */
export function comradeshipOf(uid: string, data: unknown): Comradeship | null {
    const d = (data ?? {}) as Record<string, unknown>;
    const uids = Array.isArray(d.uids) ? (d.uids as unknown[]) : [];
    const other = uids.find((u) => u !== uid);
    if (
        uids.length !== 2 ||
        !uids.includes(uid) ||
        typeof other !== 'string' ||
        typeof d.from !== 'string' ||
        !uids.includes(d.from) ||
        !(COMRADESHIP_STATUSES as readonly unknown[]).includes(d.status)
    )
        return null;
    return {
        other,
        from: d.from,
        status: d.status as ComradeshipStatus,
        createdAt: typeof d.createdAt === 'number' ? d.createdAt : 0,
        ...(typeof d.respondedAt === 'number'
            ? { respondedAt: d.respondedAt }
            : {}),
        ...(d.hiddenFromSender === true ? { hiddenFromSender: true } : {}),
    };
}

/**
 * What one person sees about another: nothing yet, a request they sent, a
 * request waiting for their answer, or comrades. A declined request looks
 * sent to its sender (declining is silent) until the cooldown ends or they
 * take it back; the person who declined sees nothing.
 */
export type ComradeState = 'none' | 'sent' | 'received' | 'comrades';

export function comradeState(
    viewer: string,
    pair: Comradeship | null | undefined,
    now: number
): ComradeState {
    if (!pair) return 'none';
    if (pair.status === 'accepted') return 'comrades';
    const asked = pair.from === viewer;
    if (pair.status === 'pending') return asked ? 'sent' : 'received';
    // Declined.
    if (!asked || pair.hiddenFromSender || !inCooldown(pair, now))
        return 'none';
    return 'sent';
}

/** What `viewer` sees about `other`, from the viewer's comradeships, as of now. */
export function comradeStateWith(
    viewer: string,
    other: string,
    pairs: Comradeship[],
    now = Date.now()
): ComradeState {
    return comradeState(
        viewer,
        pairs.find((p) => p.other === other),
        now
    );
}

/** Whether a declined request still blocks its sender from asking again. */
export function inCooldown(pair: Comradeship, now: number): boolean {
    return (
        pair.status === 'declined' &&
        now - (pair.respondedAt ?? pair.createdAt) <
            DECLINE_COOLDOWN_DAYS * DAY_MS
    );
}

/** Whether someone's "who can send me requests" setting lets this sender ask. */
export function acceptsRequestsFrom(
    setting: ComradeRequestSetting,
    sharesGroup: boolean
): boolean {
    if (setting === 'anyone') return true;
    if (setting === 'groups') return sharesGroup;
    return false;
}

/**
 * What sending a request does, decided on fresh data in a transaction:
 * - `create` a new pending request (and notify them);
 * - `accept` theirs, if they had already asked (both want it);
 * - `already` nothing to do (pending from us, or comrades);
 * - `silent` a declined request still cooling down: nothing changes for
 *   them, and the sender sees "Request sent", as if it had gone through;
 * - `closed` their setting doesn't take requests from the sender;
 * - `limit` the sender has too many requests waiting.
 */
export type SendOutcome =
    'create' | 'accept' | 'already' | 'silent' | 'closed' | 'limit';

export function sendOutcome({
    sender,
    pair,
    now,
    accepts,
    pendingSent,
}: {
    sender: string;
    pair: Comradeship | null;
    now: number;
    /** acceptsRequestsFrom for the other person's setting. */
    accepts: boolean;
    /** How many of the sender's requests are waiting. */
    pendingSent: number;
}): SendOutcome {
    if (pair?.status === 'accepted') return 'already';
    if (pair?.status === 'pending')
        return pair.from === sender ? 'already' : 'accept';
    if (
        pair?.status === 'declined' &&
        pair.from === sender &&
        inCooldown(pair, now)
    )
        return 'silent';
    if (!accepts) return 'closed';
    if (pendingSent >= MAX_PENDING_SENT) return 'limit';
    return 'create';
}

/** The requests a sender has waiting (they count toward MAX_PENDING_SENT). */
export function pendingSentCount(uid: string, pairs: Comradeship[]): number {
    return pairs.filter((p) => p.status === 'pending' && p.from === uid).length;
}

/** Requests waiting for this person's answer, newest first. */
export function receivedRequests(
    uid: string,
    pairs: Comradeship[]
): Comradeship[] {
    return pairs
        .filter((p) => p.status === 'pending' && p.from !== uid)
        .sort((a, b) => b.createdAt - a.createdAt);
}

/** This person's comrades, most recent first. */
export function acceptedComrades(pairs: Comradeship[]): Comradeship[] {
    return pairs
        .filter((p) => p.status === 'accepted')
        .sort(
            (a, b) =>
                (b.respondedAt ?? b.createdAt) - (a.respondedAt ?? a.createdAt)
        );
}

export const COMRADE_INTENTS = [
    'request',
    'cancel',
    'accept',
    'decline',
    'remove',
] as const;
export type ComradeIntent = (typeof COMRADE_INTENTS)[number];

/** The comrade forms (button on a profile, request lists), checked on the server. */
export const comradeActionSchema = z.object({
    uid: z.string().min(1).max(128),
    intent: z.enum(COMRADE_INTENTS),
});

/** How many comrades a profile shows before "See all comrades". */
export const PROFILE_COMRADES_SHOWN = 6;
