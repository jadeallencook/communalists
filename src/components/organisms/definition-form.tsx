'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { ChoiceGroup } from '@/components/molecules/choice-group';
import { localeNames } from '@/i18n/routing';
import {
    DEFINITION_LOCALES,
    DEFINITION_MAX,
    DETAILS_MAX,
    RELATED_MAX,
    SLUG_MAX,
    WORD_MAX,
    type DefinitionEntry,
    type DefinitionErrorKey,
    type DefinitionField,
    limitFor,
    type DefinitionLocale,
} from '@/lib/definitions';

export interface DefinitionFormValues {
    slug: string;
    text: Record<DefinitionLocale, DefinitionEntry>;
    related: string[];
}

export type DefinitionFormErrorKey =
    'slugTaken' | 'notFound' | 'notAllowed' | 'generic';

export interface DefinitionFormState {
    fieldErrors?: Partial<Record<DefinitionField, DefinitionErrorKey>>;
    formError?: DefinitionFormErrorKey;
    /** Echoed back so the form keeps what was typed. */
    values?: DefinitionFormValues;
    /** Changes on every result, so focus moves to the errors each time. */
    at?: number;
}

export interface DefinitionFormProps {
    /** `create` asks for the slug; `edit` shows it, since slugs are permanent. */
    mode: 'create' | 'edit';
    /** What the form starts with (the word being edited). */
    initial?: DefinitionFormValues;
    /** Other words that can be linked, already in the UI language. */
    relatedOptions: { slug: string; word: string }[];
    /** UI locale, sent so the server answers in it. */
    locale: string;
    state: DefinitionFormState;
    /** In the app, saveDefinitionAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
}

/** A field's name for people: "Word (Español)", "Address". */
export function definitionFieldName(
    t: ReturnType<typeof useTranslations<'AdminDefinitions'>>,
    field: DefinitionField
): string {
    if (field === 'slug' || field === 'related') return t(field);
    const [lang, key] = field.split('.') as [
        DefinitionLocale,
        keyof DefinitionEntry,
    ];
    return t('fieldIn', { field: t(key), language: localeNames[lang] });
}

const fieldId = (field: DefinitionField) =>
    `definition-${field.replace('.', '-')}`;

/** Order of fields in the error summary: the same as on the page. */
const FIELD_ORDER: DefinitionField[] = [
    'slug',
    ...DEFINITION_LOCALES.flatMap((locale) =>
        (['word', 'definition', 'details'] as const).map(
            (key) => `${locale}.${key}` as DefinitionField
        )
    ),
    'related',
];

/**
 * A super user adds or edits a dictionary word in all four languages. No
 * logic: it renders `state`. With errors, a summary at the top takes focus
 * and links to each field.
 */
export function DefinitionForm({
    mode,
    initial,
    relatedOptions,
    locale,
    state,
    formAction,
    pending = false,
}: DefinitionFormProps) {
    const t = useTranslations('AdminDefinitions');
    const values = state.values ?? initial;
    const errors = state.fieldErrors ?? {};
    const errorFields = FIELD_ORDER.filter((field) => errors[field]);
    const hasProblems = errorFields.length > 0 || !!state.formError;

    const summaryRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (state.at && hasProblems) summaryRef.current?.focus();
    }, [state.at, hasProblems]);

    const errorFor = (field: DefinitionField) => {
        const key = errors[field];
        return key ? t(`errors.${key}`, { max: limitFor(field) }) : undefined;
    };
    const fieldName = (field: DefinitionField) => definitionFieldName(t, field);

    const describe = (field: DefinitionField, hasHint: boolean) =>
        [
            errors[field] ? `${fieldId(field)}-error` : null,
            hasHint ? `${fieldId(field)}-hint` : null,
        ]
            .filter(Boolean)
            .join(' ') || undefined;
    const errorText = (field: DefinitionField) =>
        errors[field] ? (
            <p
                id={`${fieldId(field)}-error`}
                className="text-sm text-destructive"
            >
                {errorFor(field)}
            </p>
        ) : null;

    return (
        <form action={formAction} noValidate className="flex flex-col gap-8">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="mode" value={mode} />

            <div
                ref={summaryRef}
                tabIndex={-1}
                className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                {hasProblems && (
                    <div
                        role="alert"
                        className="flex flex-col gap-2 rounded-lg border border-destructive p-4 text-sm"
                    >
                        {state.formError && (
                            <p className="font-medium text-destructive">
                                {t(`formErrors.${state.formError}`)}
                            </p>
                        )}
                        {errorFields.length > 0 && (
                            <>
                                <p className="font-medium text-destructive">
                                    {t('summary', {
                                        count: errorFields.length,
                                    })}
                                </p>
                                <ul className="ml-4 list-disc">
                                    {errorFields.map((field) => (
                                        <li key={field}>
                                            <a
                                                href={`#${fieldId(field)}`}
                                                className="underline underline-offset-2"
                                            >
                                                {fieldName(field)}:{' '}
                                                {errorFor(field)}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}
            </div>

            <FieldGroup>
                {mode === 'create' ? (
                    <Field data-invalid={!!errors.slug}>
                        <FieldLabel htmlFor={fieldId('slug')}>
                            {t('slug')}
                        </FieldLabel>
                        <Input
                            id={fieldId('slug')}
                            name="slug"
                            defaultValue={values?.slug}
                            maxLength={SLUG_MAX}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            aria-invalid={errors.slug ? true : undefined}
                            aria-describedby={describe('slug', true)}
                            required
                        />
                        {errorText('slug')}
                        <FieldDescription id={`${fieldId('slug')}-hint`}>
                            {t('slugHint')}
                        </FieldDescription>
                    </Field>
                ) : (
                    <div className="flex flex-col gap-1">
                        <input type="hidden" name="slug" value={values?.slug} />
                        <p className="text-sm font-medium">{t('slug')}</p>
                        <p className="font-mono text-sm break-all">
                            /dictionary/{values?.slug}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('slugFixed')}
                        </p>
                    </div>
                )}

                {DEFINITION_LOCALES.map((lang) => {
                    const entry = values?.text[lang];
                    const word = `${lang}.word` as const;
                    const definition = `${lang}.definition` as const;
                    const details = `${lang}.details` as const;
                    return (
                        <FieldSet key={lang} className="rounded-lg border p-4">
                            <FieldLegend>{localeNames[lang]}</FieldLegend>
                            <Field data-invalid={!!errors[word]}>
                                <FieldLabel htmlFor={fieldId(word)}>
                                    {t('word')}
                                </FieldLabel>
                                <Input
                                    id={fieldId(word)}
                                    name={word}
                                    lang={lang}
                                    defaultValue={entry?.word}
                                    maxLength={WORD_MAX}
                                    aria-invalid={
                                        errors[word] ? true : undefined
                                    }
                                    aria-describedby={describe(word, false)}
                                    required
                                />
                                {errorText(word)}
                            </Field>
                            <Field data-invalid={!!errors[definition]}>
                                <FieldLabel htmlFor={fieldId(definition)}>
                                    {t('definition')}
                                </FieldLabel>
                                <Textarea
                                    id={fieldId(definition)}
                                    name={definition}
                                    lang={lang}
                                    defaultValue={entry?.definition}
                                    maxLength={DEFINITION_MAX}
                                    rows={3}
                                    aria-invalid={
                                        errors[definition] ? true : undefined
                                    }
                                    aria-describedby={describe(
                                        definition,
                                        true
                                    )}
                                    required
                                />
                                {errorText(definition)}
                                <FieldDescription
                                    id={`${fieldId(definition)}-hint`}
                                >
                                    {t('definitionHint', {
                                        max: DEFINITION_MAX,
                                    })}
                                </FieldDescription>
                            </Field>
                            <Field data-invalid={!!errors[details]}>
                                <FieldLabel htmlFor={fieldId(details)}>
                                    {t('details')}
                                </FieldLabel>
                                <Textarea
                                    id={fieldId(details)}
                                    name={details}
                                    lang={lang}
                                    defaultValue={entry?.details}
                                    maxLength={DETAILS_MAX}
                                    rows={5}
                                    aria-invalid={
                                        errors[details] ? true : undefined
                                    }
                                    aria-describedby={describe(details, true)}
                                />
                                {errorText(details)}
                                <FieldDescription
                                    id={`${fieldId(details)}-hint`}
                                >
                                    {t('detailsHint')}
                                </FieldDescription>
                            </Field>
                        </FieldSet>
                    );
                })}

                {relatedOptions.length > 0 && (
                    <div id={fieldId('related')} tabIndex={-1}>
                        <ChoiceGroup
                            kind="checkbox"
                            name="related"
                            legend={t('related')}
                            hint={t('relatedHint', { max: RELATED_MAX })}
                            options={relatedOptions.map((option) => ({
                                value: option.slug,
                                label: option.word,
                            }))}
                            defaultValue={values?.related ?? []}
                            error={errorFor('related')}
                            columns
                        />
                    </div>
                )}
            </FieldGroup>

            <Button type="submit" size="lg" disabled={pending}>
                {pending
                    ? t('saving')
                    : mode === 'create'
                      ? t('create')
                      : t('save')}
            </Button>
        </form>
    );
}
