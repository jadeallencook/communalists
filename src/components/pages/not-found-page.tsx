import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';

export interface NotFoundAction {
    href: string;
    label: string;
}

export interface NotFoundPageProps {
    /** What wasn't found, in plain words ("There's no word “mutal-aid” yet"). */
    title: string;
    /** Why that can happen, and what to try. */
    description: string;
    /** The address they tried (no locale), shown so a typo is easy to spot. */
    address?: string;
    /** Where to go instead; the first is the main one. */
    actions: NotFoundAction[];
    /** Extra help between the text and the actions (word suggestions). */
    children?: ReactNode;
}

/**
 * A 404: what wasn't found, why, the address they tried, and where to go
 * instead. The general page and each kind of page (a word, an
 * organization, a person) fill it in with their own wording.
 */
export function NotFoundPage({
    title,
    description,
    address,
    actions,
    children,
}: NotFoundPageProps) {
    const t = useTranslations('NotFound');
    return (
        <section className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-4 py-16">
            <p className="text-sm font-medium text-muted-foreground">
                {t('eyebrow')}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-pretty break-words">
                {title}
            </h1>
            <p className="text-pretty text-muted-foreground">{description}</p>
            {address && (
                <p className="text-sm">
                    {t('tried')}{' '}
                    <code className="rounded bg-muted px-1.5 py-0.5 break-all text-foreground">
                        {address}
                    </code>
                </p>
            )}
            {children}
            <div className="flex flex-wrap gap-2 pt-2">
                {actions.map((action, i) => (
                    <Button
                        key={action.href}
                        asChild
                        variant={i === 0 ? 'default' : 'outline'}
                    >
                        <Link href={action.href}>{action.label}</Link>
                    </Button>
                ))}
            </div>
        </section>
    );
}
