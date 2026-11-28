'use client';

import { ErrorPage } from '@/components/pages/error-page';

// Any page that throws while rendering lands here, inside the site's header
// and footer, instead of the framework's bare error screen. Sections that
// read Firestore should still catch their own failures and say so in place
// (decision #68); this is the safety net for anything they don't.

export default function Error({
    error,
    retry,
}: {
    error: unknown;
    retry: () => void;
}) {
    const digest =
        error instanceof Error
            ? (error as Error & { digest?: string }).digest
            : undefined;
    return <ErrorPage onRetry={retry} digest={digest} />;
}
