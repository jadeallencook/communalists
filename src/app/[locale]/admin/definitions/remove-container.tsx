'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import {
    DefinitionRemove,
    type RemoveDefinitionState,
} from '@/components/organisms/definition-remove';

import { removeDefinitionAction } from './actions';

/** Wires "Remove this word" to removeDefinitionAction. */
export function DefinitionRemoveContainer({
    slug,
    word,
}: {
    slug: string;
    word: string;
}) {
    const locale = useLocale();
    const [state, formAction, pending] = useActionState<
        RemoveDefinitionState,
        FormData
    >(removeDefinitionAction, {});
    return (
        <DefinitionRemove
            slug={slug}
            word={word}
            locale={locale}
            formAction={formAction}
            pending={pending}
            state={state}
        />
    );
}
