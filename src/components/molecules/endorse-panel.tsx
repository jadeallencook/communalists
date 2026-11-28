import { CheckIcon, HeartHandshakeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';
import type { EndorseState } from '@/lib/endorsements';
import { track } from '@/lib/analytics';
import { organizationPath } from '@/lib/paths';

export interface EndorsePanelProps {
    state: EndorseState;
    /** How many people endorse the organization. */
    count: number;
    orgId: string;
    handle: string;
    /** UI locale, sent so redirects stay in it. */
    locale: string;
    /** In the app, endorseAction via useActionState. Reads `intent`: endorse or remove. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Already translated confirmation of the last action. */
    notice?: string;
    /** Already translated. */
    error?: string;
    /** Whether the viewer endorses it couldn't be loaded: the count, a message, no button. */
    loadFailed?: boolean;
}

/**
 * The Endorse card on an organization's page: how many people endorse it,
 * and Endorse or Remove endorsement. Anyone can endorse, member or not. The
 * button stays the same element in every state, and is never `disabled`, so
 * focus stays on it after pressing. No logic: `state` decides.
 */
export function EndorsePanel({
    state,
    count,
    orgId,
    handle,
    locale,
    formAction,
    pending = false,
    notice,
    error,
    loadFailed = false,
}: EndorsePanelProps) {
    const t = useTranslations('Endorsements');
    const endorsed = state === 'endorsed';
    return (
        <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
                <HeartHandshakeIcon aria-hidden className="size-4" />
                {t('title')}
            </h2>
            <p className="text-sm">
                {count > 0 ? t('count', { count }) : t('none')}
            </p>
            {loadFailed ? (
                <p className="text-sm text-muted-foreground">
                    {t('loadFailed')}
                </p>
            ) : state === 'signedOut' ? (
                <div className="flex flex-col gap-2">
                    <Button asChild variant="outline" className="w-full">
                        <Link
                            href={{
                                pathname: '/sign-in',
                                query: { next: organizationPath(handle) },
                            }}
                            {...track('org-endorse-sign-in', { org: handle })}
                        >
                            {t('signIn')}
                        </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t('hint')}
                    </span>
                </div>
            ) : (
                <form action={formAction} className="flex flex-col gap-2">
                    <input type="hidden" name="orgId" value={orgId} />
                    <input type="hidden" name="handle" value={handle} />
                    <input type="hidden" name="locale" value={locale} />
                    <input
                        type="hidden"
                        name="intent"
                        value={endorsed ? 'remove' : 'endorse'}
                    />
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        {endorsed && (
                            <CheckIcon
                                aria-hidden
                                className="mt-0.5 size-4 shrink-0"
                            />
                        )}
                        {endorsed ? t('youEndorse') : t('hint')}
                    </p>
                    <Button
                        type="submit"
                        variant={endorsed ? 'outline' : 'default'}
                        size={endorsed ? 'sm' : 'default'}
                        // aria-disabled, not disabled: a disabled button
                        // loses keyboard focus while the action runs.
                        aria-disabled={pending}
                        onClick={(e) => {
                            if (pending) e.preventDefault();
                        }}
                        className="w-full aria-disabled:opacity-50"
                        {...track(endorsed ? 'org-unendorse' : 'org-endorse', {
                            org: handle,
                        })}
                    >
                        {endorsed ? t('remove') : t('endorse')}
                    </Button>
                </form>
            )}
            <p
                role="status"
                className="text-sm text-muted-foreground empty:hidden"
            >
                {notice}
            </p>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </section>
    );
}
