'use client';

import { RotateCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';

export interface ErrorPageProps {
    /** Tries the page again (Next's `retry`). */
    onRetry: () => void;
    /** The error's id from the server logs, so a report can be matched. */
    digest?: string;
}

/**
 * Shown when a page can't load (say, the database didn't answer): what
 * happened in plain words, Try again, and a way home. Never the error's
 * details. Focus moves to the heading so screen readers hear it.
 */
export function ErrorPage({ onRetry, digest }: ErrorPageProps) {
    const t = useTranslations('Errors');
    const headingRef = useRef<HTMLHeadingElement>(null);
    useEffect(() => {
        headingRef.current?.focus();
    }, []);
    return (
        <section className="mx-auto flex w-full max-w-xl flex-col items-start gap-4 px-4 py-16">
            <h1
                ref={headingRef}
                tabIndex={-1}
                className="font-heading text-3xl font-semibold tracking-tight outline-none"
            >
                {t('title')}
            </h1>
            <p className="text-pretty text-muted-foreground">{t('body')}</p>
            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onRetry}>
                    <RotateCwIcon aria-hidden />
                    {t('retry')}
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">{t('home')}</Link>
                </Button>
            </div>
            {digest && (
                <p className="text-xs text-muted-foreground">
                    {t('reference', { digest })}
                </p>
            )}
        </section>
    );
}
