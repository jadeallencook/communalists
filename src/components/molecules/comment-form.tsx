'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/atoms/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/atoms/field';
import { Textarea } from '@/components/atoms/textarea';
import { localeNames, type Locale } from '@/i18n/routing';
import { charactersLeft, COMMENT_LANGS, COMMENT_MAX } from '@/lib/comments';
import { cn } from '@/lib/utils';

const languageName = (code: string) => localeNames[code as Locale] ?? code;

export interface CommentFormProps {
    value: string;
    onChange: (value: string) => void;
    /** The comment's language: the UI language unless the person changes it. */
    lang: string;
    onLangChange: (lang: string) => void;
    /** Show the language picker from the start (Storybook). */
    defaultChoosingLanguage?: boolean;
    onSubmit: () => void;
    posting?: boolean;
    /** Already translated. */
    error?: string;
    /** Changes with each new error, so focus goes back to the text. */
    errorKey?: number;
    /** Extra attributes for the submit button (analytics). */
    submitProps?: Record<string, string>;
    /**
     * Writing the organization's reply instead of a comment: who it's shown
     * as from ("South Bay Mutual Aid", or the Communalists team), and
     * Cancel. Focus starts in the text box.
     */
    reply?: { from: string; onCancel: () => void };
    /** Prefix for the form's element ids, so a reply form and the comment form can share a page. */
    idPrefix?: string;
}

/**
 * Write a comment (or the organization's reply) and Post. Says the comment is public. Its language is the
 * UI language, shown as "Written in English · Change"; Change opens a picker
 * for people writing in another language (it sets the screen reader voice
 * and which readers see the comment first).
 */
export function CommentForm({
    value,
    onChange,
    lang,
    onLangChange,
    defaultChoosingLanguage = false,
    onSubmit,
    posting = false,
    error,
    errorKey,
    submitProps,
    reply,
    idPrefix = 'comment',
}: CommentFormProps) {
    const t = useTranslations('Discussion');
    const format = useFormatter();
    const textRef = useRef<HTMLTextAreaElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const [choosing, setChoosing] = useState(defaultChoosingLanguage);
    useEffect(() => {
        if (errorKey) textRef.current?.focus();
    }, [errorKey]);
    // A reply form opens where its button was: start typing there.
    const replying = !!reply;
    useEffect(() => {
        if (replying) textRef.current?.focus();
    }, [replying]);
    const id = (name: string) => `${idPrefix}-${name}`;
    const left = charactersLeft(value);
    const describedBy = [id('hint'), id('count'), error && id('error')]
        .filter(Boolean)
        .join(' ');

    return (
        <form
            noValidate
            className="flex flex-col gap-3"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <Field data-invalid={!!error}>
                <FieldLabel htmlFor={id('text')}>
                    {reply
                        ? t('replyFormLabel', { from: reply.from })
                        : t('formLabel')}
                </FieldLabel>
                <FieldDescription id={id('hint')}>
                    {reply
                        ? t('replyFormHint', { from: reply.from })
                        : t('formHint')}
                </FieldDescription>
                <Textarea
                    ref={textRef}
                    id={id('text')}
                    name="text"
                    lang={lang}
                    rows={4}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                />
                {/* Not a live region: it would talk over every keystroke. */}
                <p
                    id={id('count')}
                    className={cn(
                        'text-sm',
                        left < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}
                >
                    {left < 0
                        ? t('tooLongBy', { count: -left })
                        : t('charactersLeft', {
                              count: left,
                              max: format.number(COMMENT_MAX),
                          })}
                </p>
                <FieldError id={id('error')}>{error}</FieldError>
            </Field>
            <div className="flex flex-col items-start gap-2 text-sm">
                <p>
                    {t('writtenIn', { language: languageName(lang) })}
                    {!choosing && (
                        <>
                            {' · '}
                            <button
                                type="button"
                                // Starts with the visible word, so voice control still finds it.
                                aria-label={t(
                                    reply
                                        ? 'replyChangeLanguageLabel'
                                        : 'changeLanguageLabel'
                                )}
                                className="min-h-6 underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring"
                                onClick={() => {
                                    setChoosing(true);
                                    // After it renders.
                                    setTimeout(() =>
                                        selectRef.current?.focus()
                                    );
                                }}
                            >
                                {t('changeLanguage')}
                            </button>
                        </>
                    )}
                </p>
                {choosing && (
                    <div className="flex flex-col gap-1">
                        <label htmlFor={id('lang')} className="font-medium">
                            {reply ? t('replyLanguage') : t('language')}
                        </label>
                        <select
                            ref={selectRef}
                            id={id('lang')}
                            name="lang"
                            value={lang}
                            onChange={(event) =>
                                onLangChange(event.target.value)
                            }
                            className="h-8 rounded-lg border border-control bg-transparent px-2.5 text-sm dark:bg-input/30"
                        >
                            {COMMENT_LANGS.map((code) => (
                                <option key={code} value={code} lang={code}>
                                    {languageName(code)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="submit"
                    // Not `disabled`, which would drop focus; posting twice is ignored.
                    aria-disabled={posting || undefined}
                    {...submitProps}
                >
                    {posting
                        ? t('posting')
                        : reply
                          ? t('replyPost')
                          : t('post')}
                </Button>
                {reply && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={reply.onCancel}
                    >
                        {t('cancel')}
                    </Button>
                )}
            </div>
        </form>
    );
}
