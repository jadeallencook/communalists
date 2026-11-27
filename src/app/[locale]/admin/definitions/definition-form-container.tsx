'use client';

import { useLocale } from 'next-intl';
import { useActionState } from 'react';

import {
    DefinitionForm,
    type DefinitionFormProps,
    type DefinitionFormState,
} from '@/components/organisms/definition-form';

import { saveDefinitionAction } from './actions';

/** Wires the dictionary word form to saveDefinitionAction. */
export function DefinitionFormContainer(
    props: Pick<DefinitionFormProps, 'mode' | 'initial' | 'relatedOptions'>
) {
    const locale = useLocale();
    const [state, formAction, pending] = useActionState<
        DefinitionFormState,
        FormData
    >(saveDefinitionAction, {});
    return (
        <DefinitionForm
            {...props}
            locale={locale}
            state={state}
            formAction={formAction}
            pending={pending}
        />
    );
}
