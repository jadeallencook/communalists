'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import { useRelatedWords } from '@/hooks/use-related-words';

import {
    DefinitionForm,
    type DefinitionFormProps,
    type DefinitionFormState,
} from '@/components/organisms/definition-form';

import { saveDefinitionAction } from './actions';

/** Wires the dictionary word form to saveDefinitionAction and the related-words search. */
export function DefinitionFormContainer({
    relatedOptions,
    ...props
}: Pick<DefinitionFormProps, 'mode' | 'initial' | 'returnTo'> & {
    /** Other words that can be linked, already in the UI language. */
    relatedOptions: { slug: string; word: string }[];
}) {
    const locale = useLocale();
    const related = useRelatedWords({
        options: relatedOptions,
        initial: props.initial?.related,
    });
    const [state, formAction, pending] = useActionState<
        DefinitionFormState,
        FormData
    >(saveDefinitionAction, {});
    return (
        <DefinitionForm
            {...props}
            related={related}
            locale={locale}
            state={state}
            formAction={formAction}
            pending={pending}
        />
    );
}
