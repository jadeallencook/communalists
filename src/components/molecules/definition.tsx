'use client';

import { useLocale, useTranslations } from 'next-intl';
import { createContext, useContext, useEffect, type ReactNode } from 'react';

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/atoms/tooltip';
import type { DefinitionPreviews } from '@/hooks/use-definition-previews';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';

export interface DefinitionsContextValue {
    state: DefinitionPreviews;
    /** Asks for the definitions; marked words call it when they appear. */
    load: () => void;
}

/**
 * The short definitions marked words show. The app provides it in the root
 * layout (DefinitionsContainer); stories provide fixed ones. Without a
 * provider, words are plain links with no tooltip.
 */
export const DefinitionsContext = createContext<DefinitionsContextValue>({
    state: { status: 'idle' },
    load: () => {},
});

export interface DefinitionProps {
    /** The word's slug: the visible text changes with the language, the slug doesn't. */
    slug: string;
    /** The words as they appear in the sentence. */
    children: ReactNode;
}

/**
 * A word from the dictionary, marked in our own copy: a dotted underline (not
 * a regular link's solid one). Hovering or focusing it shows the short
 * definition; choosing it opens the word's page. A slug that isn't in the
 * dictionary shows as plain text. Place by hand, on a word's first use.
 */
export function Definition({ slug, children }: DefinitionProps) {
    const t = useTranslations('Dictionary.inline');
    const locale = useLocale();
    const { state, load } = useContext(DefinitionsContext);
    useEffect(load, [load]);

    const preview = state.status === 'ready' ? state.previews[slug] : null;
    if (state.status === 'ready' && !preview) return <>{children}</>;

    const link = (
        <Link
            href={`/dictionary/${slug}`}
            className="underline decoration-current/60 decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid focus-visible:decoration-solid"
            {...track('definition-open', { slug })}
        >
            {children}
        </Link>
    );
    // Still loading, or the list couldn't load: a plain link to the page.
    if (!preview) return link;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent
                lang={preview.lang}
                side="top"
                sideOffset={4}
                className="flex max-w-xs flex-col items-start gap-1 px-3 py-2 text-sm motion-reduce:animate-none"
            >
                <span className="font-semibold">{preview.word}</span>
                <span className="text-pretty">{preview.definition}</span>
                <span lang={locale} className="text-xs opacity-80">
                    {t('readMore')}
                </span>
            </TooltipContent>
        </Tooltip>
    );
}
