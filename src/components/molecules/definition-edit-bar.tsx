'use client';

import { PencilIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import { Link } from '@/i18n/navigation';

export interface DefinitionEditBarProps {
    slug: string;
    /** The word, in the language it's shown in. */
    word: string;
    /** Just saved from the edit form: says so and takes focus. */
    saved?: boolean;
}

/**
 * On a word's page, for super users only (the container decides): a link to
 * edit the word, and "Saved" after coming back from the form.
 */
export function DefinitionEditBar({
    slug,
    word,
    saved = false,
}: DefinitionEditBarProps) {
    const t = useTranslations('AdminDefinitions');
    const savedRef = useRef<HTMLParagraphElement>(null);
    useEffect(() => {
        if (saved) savedRef.current?.focus();
    }, [saved]);
    return (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-3">
            <p className="text-sm text-muted-foreground">{t('pageOnly')}</p>
            <Button asChild variant="outline" className="break-words">
                <Link
                    href={{
                        pathname: `/admin/definitions/${slug}`,
                        query: { from: 'page' },
                    }}
                >
                    <PencilIcon aria-hidden />
                    {t('editWord', { word })}
                </Link>
            </Button>
            <p
                ref={savedRef}
                role="status"
                tabIndex={-1}
                className="text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {saved ? t('saved', { word }) : null}
            </p>
        </div>
    );
}
