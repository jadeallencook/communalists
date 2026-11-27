'use client';

import { useLocale } from 'next-intl';
import { useMemo, type ReactNode } from 'react';

import { TooltipProvider } from '@/components/atoms/tooltip';
import { DefinitionsContext } from '@/components/molecules/definition';
import { useDefinitionPreviews } from '@/hooks/use-definition-previews';

/**
 * Gives every page's marked words (<Definition>) their short definitions.
 * Nothing is fetched until a page has a marked word.
 */
export function DefinitionsContainer({ children }: { children: ReactNode }) {
    const locale = useLocale();
    const { state, load } = useDefinitionPreviews(locale);
    const value = useMemo(() => ({ state, load }), [state, load]);
    return (
        <DefinitionsContext.Provider value={value}>
            {/* A short delay, so moving the pointer across text doesn't flash tooltips. */}
            <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        </DefinitionsContext.Provider>
    );
}
