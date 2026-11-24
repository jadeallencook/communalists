import { ArrowLeftIcon, ClockIcon, InfoIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Skeleton } from '@/components/atoms/skeleton';
import { Link } from '@/i18n/navigation';
import type { ClaimIntent, ClaimPageState } from '@/lib/organizations/claims';

export interface ClaimOrganizationPageProps {
    name: string;
    handle: string;
    orgId: string;
    /** From claimPageState: the form, the pending request, or the form after a denial. */
    state: ClaimPageState;
    /** The pending request's choice, to say what they asked for. */
    pendingIntent?: ClaimIntent;
    /** When the pending request was sent, already formatted. */
    pendingSince?: string;
    /** The form (ClaimOrganizationForm, wired by a container). */
    form: ReactNode;
    /** In the app, cancelClaimAction (a server action). */
    cancelAction: (formData: FormData) => void | Promise<void>;
    /** UI locale, sent so redirects stay in it. */
    locale: string;
}

/** /org/{handle}/claim: what claiming means, then the request or its status. */
export function ClaimOrganizationPage({
    name,
    handle,
    orgId,
    state,
    pendingIntent,
    pendingSince,
    form,
    cancelAction,
    locale,
}: ClaimOrganizationPageProps) {
    const t = useTranslations('Claim');
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            <Button asChild variant="outline" size="sm" className="self-start">
                <Link href={`/org/${handle}`}>
                    <ArrowLeftIcon aria-hidden />
                    {t('back', { name })}
                </Link>
            </Button>
            <header className="flex flex-col gap-3">
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance">
                    {t('title', { name })}
                </h1>
                <p className="text-pretty text-muted-foreground">
                    {t('intro', { name })}
                </p>
                <ol className="ml-5 list-decimal text-sm text-pretty">
                    <li>{t('step1')}</li>
                    <li>{t('step2')}</li>
                    <li>{t('step3')}</li>
                </ol>
            </header>

            {state === 'pending' ? (
                <section
                    aria-labelledby="claim-pending"
                    className="flex flex-col gap-3 rounded-lg border p-5"
                >
                    <h2
                        id="claim-pending"
                        className="flex items-center gap-2 font-heading text-lg font-semibold"
                    >
                        <ClockIcon aria-hidden className="size-4" />
                        {t('pendingTitle')}
                    </h2>
                    <p role="status" className="text-sm">
                        {t(
                            pendingIntent === 'remove'
                                ? 'pendingRemove'
                                : 'pendingClaim',
                            { name, date: pendingSince ?? '' }
                        )}
                    </p>
                    <form action={cancelAction}>
                        <input type="hidden" name="orgId" value={orgId} />
                        <input type="hidden" name="handle" value={handle} />
                        <input type="hidden" name="locale" value={locale} />
                        <Button type="submit" variant="outline" size="sm">
                            {t('cancel')}
                        </Button>
                    </form>
                </section>
            ) : (
                <>
                    {state === 'deniedCanRetry' && (
                        <p
                            role="status"
                            className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-sm"
                        >
                            <InfoIcon
                                aria-hidden
                                className="mt-0.5 size-4 shrink-0"
                            />
                            {t('denied')}
                        </p>
                    )}
                    {form}
                </>
            )}
        </section>
    );
}

/** Shown while the page loads. */
export function ClaimOrganizationPageLoading() {
    return (
        <section className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
        </section>
    );
}
