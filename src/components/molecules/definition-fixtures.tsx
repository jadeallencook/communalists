// Sample previews for stories that show marked words (<Definition>).
import type { ReactNode } from 'react';

import { TooltipProvider } from '@/components/atoms/tooltip';
import type { DefinitionPreview } from '@/lib/definitions';
import type { DefinitionPreviews } from '@/hooks/use-definition-previews';

import { DefinitionsContext } from './definition';

export const samplePreviews: Record<string, DefinitionPreview> = {
    'mutual-aid': {
        word: 'Mutual Aid',
        definition:
            'Neighbors helping each other directly with what they need, like food, rides or rent, and sharing what they have. Everyone can give and receive.',
        lang: 'en',
    },
    'mutual-aid-network': {
        word: 'Mutual Aid Network',
        definition:
            "People and groups in an area who connect to share help and resources, so a need one group can't meet can reach someone who can.",
        lang: 'en',
    },
    'tool-library': {
        word: 'Tool Library',
        definition:
            'A lending library for tools, like drills, ladders and garden equipment, so neighbors can borrow what they need instead of each buying their own.',
        lang: 'en',
    },
    organization: {
        word: 'Organization',
        definition:
            "On Communalists, a group's home: a public page where neighbors can find it, plus tools its members use together.",
        lang: 'en',
    },
};

/** Gives marked words in a story their definitions, as the app's layout does. */
export function WithDefinitions({
    state = { status: 'ready', previews: samplePreviews },
    children,
}: {
    state?: DefinitionPreviews;
    children: ReactNode;
}) {
    return (
        <DefinitionsContext.Provider value={{ state, load: () => {} }}>
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </DefinitionsContext.Provider>
    );
}
