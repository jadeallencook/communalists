'use client';

import { useEffect, useState } from 'react';

import {
    fetchHandleAvailability,
    type HandleCheck,
} from '@/lib/organizations/client';
import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';

export type HandleStatus =
    | { state: 'empty' }
    /** Editing: unchanged from the organization's current handle. */
    | { state: 'current' }
    | { state: 'checking' }
    | { state: 'available' }
    | {
          state: 'unavailable';
          reason: Exclude<HandleCheck, { available: true }>['reason'];
      }
    | { state: 'unknown' };

type CheckFn = (handle: string, signal: AbortSignal) => Promise<HandleCheck>;

/**
 * Live "is this handle free?" for the create and edit forms. Shape problems (too short,
 * reserved…) are answered instantly without a request; otherwise it asks the
 * server after a pause in typing. The server checks again on submit.
 */
export function useHandleAvailability(
    input: string,
    {
        check = fetchHandleAvailability,
        debounceMs = 300,
        current,
    }: {
        check?: CheckFn;
        debounceMs?: number;
        /** Editing: the organization's handle now, which isn't "taken" for it. */
        current?: string;
    } = {}
): HandleStatus {
    const handle = normalizeHandle(input);
    const isCurrent = !!current && handle === current;
    const problem = handle && !isCurrent ? handleProblem(handle) : null;
    const [remote, setRemote] = useState<{
        handle: string;
        status: HandleStatus;
    } | null>(null);

    useEffect(() => {
        if (!handle || problem || isCurrent) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            check(handle, controller.signal)
                .then((result) =>
                    setRemote({
                        handle,
                        status: result.available
                            ? { state: 'available' }
                            : { state: 'unavailable', reason: result.reason },
                    })
                )
                .catch((error: Error) => {
                    if (error.name !== 'AbortError') {
                        setRemote({ handle, status: { state: 'unknown' } });
                    }
                });
        }, debounceMs);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [handle, problem, isCurrent, check, debounceMs]);

    if (!handle) return { state: 'empty' };
    if (isCurrent) return { state: 'current' };
    if (problem) return { state: 'unavailable', reason: problem };
    return remote?.handle === handle ? remote.status : { state: 'checking' };
}
