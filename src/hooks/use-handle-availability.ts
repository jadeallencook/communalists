'use client';

import { useEffect, useState } from 'react';

import {
    fetchHandleAvailability,
    type HandleCheck,
} from '@/lib/organizations/client';
import { handleProblem, normalizeHandle } from '@/lib/organizations/handle';

export type HandleStatus =
    | { state: 'empty' }
    | { state: 'checking' }
    | { state: 'available' }
    | {
          state: 'unavailable';
          reason: Exclude<HandleCheck, { available: true }>['reason'];
      }
    | { state: 'unknown' };

type CheckFn = (handle: string, signal: AbortSignal) => Promise<HandleCheck>;

/**
 * Live "is this handle free?" for the create form. Shape problems (too short,
 * reserved…) are answered instantly without a request; otherwise it asks the
 * server after a pause in typing. The server checks again on submit.
 */
export function useHandleAvailability(
    input: string,
    {
        check = fetchHandleAvailability,
        debounceMs = 300,
    }: { check?: CheckFn; debounceMs?: number } = {}
): HandleStatus {
    const handle = normalizeHandle(input);
    const problem = handle ? handleProblem(handle) : null;
    const [remote, setRemote] = useState<{
        handle: string;
        status: HandleStatus;
    } | null>(null);

    useEffect(() => {
        if (!handle || problem) return;
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
    }, [handle, problem, check, debounceMs]);

    if (!handle) return { state: 'empty' };
    if (problem) return { state: 'unavailable', reason: problem };
    return remote?.handle === handle ? remote.status : { state: 'checking' };
}
