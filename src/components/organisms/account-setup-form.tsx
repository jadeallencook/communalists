import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';
import {
    LocationField,
    type LocationFieldProps,
} from '@/components/molecules/location-field';
import type {
    AccountSetupField,
    AccountSetupState,
} from '@/lib/validation/account-setup';

export interface AccountSetupFormProps {
    state: AccountSetupState;
    /** In the app, the saveAccountSetup server action via useAccountSetupForm. */
    formAction: (formData: FormData) => void | Promise<void>;
    pending?: boolean;
    /** UI locale, sent so the server answers in it. */
    locale: string;
    /** `setup`: required first-time answers, then go to `next`. `settings`: edit and stay. */
    mode?: 'setup' | 'settings';
    /** Setup only: where to go after saving (already made safe by the caller). */
    next?: string;
    /** Answers already on the profile, shown filled in. */
    defaults: { name?: string; preferredLocale: string };
    /** Language choices: code and the language's own name. */
    languages: { code: string; name: string }[];
    /** The country + city picker, from useLocationPicker. */
    location: Omit<LocationFieldProps, 'error'>;
}

/** Name, preferred language and city, for account setup and account settings. No logic: it renders `state`. */
export function AccountSetupForm({
    state,
    formAction,
    pending = false,
    locale,
    mode = 'setup',
    next,
    defaults,
    languages,
    location,
}: AccountSetupFormProps) {
    const t = useTranslations('AccountSetup');

    const errorFor = (field: AccountSetupField) => {
        const key = state.fieldErrors?.[field];
        return key ? t(`errors.${key}`) : undefined;
    };
    const describe = (field: AccountSetupField, hint: string) =>
        errorFor(field) ? `${field}-error` : hint;

    return (
        <form action={formAction} noValidate>
            <input type="hidden" name="uiLocale" value={locale} />
            {next && <input type="hidden" name="next" value={next} />}
            <FieldGroup>
                <Field data-invalid={!!errorFor('name')}>
                    <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        defaultValue={state.values?.name ?? defaults.name}
                        aria-invalid={errorFor('name') ? true : undefined}
                        aria-describedby={describe('name', 'name-hint')}
                        required
                    />
                    {errorFor('name') ? (
                        <FieldError id="name-error">
                            {errorFor('name')}
                        </FieldError>
                    ) : (
                        <FieldDescription id="name-hint">
                            {t('nameHint')}
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={!!errorFor('locale')}>
                    <FieldLabel htmlFor="locale">{t('language')}</FieldLabel>
                    <select
                        id="locale"
                        name="locale"
                        defaultValue={
                            state.values?.locale ?? defaults.preferredLocale
                        }
                        aria-invalid={errorFor('locale') ? true : undefined}
                        aria-describedby={describe('locale', 'locale-hint')}
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                    >
                        {languages.map(({ code, name }) => (
                            <option key={code} value={code} lang={code}>
                                {name}
                            </option>
                        ))}
                    </select>
                    {errorFor('locale') ? (
                        <FieldError id="locale-error">
                            {errorFor('locale')}
                        </FieldError>
                    ) : (
                        <FieldDescription id="locale-hint">
                            {t('languageHint')}
                        </FieldDescription>
                    )}
                </Field>

                <LocationField
                    {...location}
                    error={errorFor('placeId') ?? errorFor('country')}
                />

                {state.formError && (
                    <p role="alert" className="text-sm text-destructive">
                        {t(`errors.${state.formError}`)}
                    </p>
                )}

                {state.saved && !pending && (
                    <p role="status" className="text-sm text-muted-foreground">
                        {t('settings.saved')}
                    </p>
                )}

                <Button type="submit" size="lg" disabled={pending}>
                    {pending
                        ? t('submitting')
                        : mode === 'settings'
                          ? t('settings.submit')
                          : t('submit')}
                </Button>
            </FieldGroup>
        </form>
    );
}
