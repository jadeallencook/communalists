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
import type { SignUpField, SignUpState } from '@/lib/validation/sign-up';

export interface SignUpFormProps {
    /** Result of the last submit: field errors, form error, and values to restore. */
    state: SignUpState;
    /** What the form submits to. In the app, the signUp server action via useSignUpForm. */
    formAction: (formData: FormData) => void | Promise<void>;
    pending?: boolean;
    /** Sent with the form so the server can answer in the right language. */
    locale: string;
    /** The country + city picker: options, selection and callbacks from the caller. */
    location: Omit<LocationFieldProps, 'error'>;
}

/** Name, email, password (twice) and location fields with inline errors. No logic: it renders `state`. */
export function SignUpForm({
    state,
    formAction,
    pending = false,
    locale,
    location,
}: SignUpFormProps) {
    const t = useTranslations('SignUp');

    const errorFor = (field: SignUpField) => {
        const key = state.fieldErrors?.[field];
        return key ? t(`errors.${key}`) : undefined;
    };
    const fieldProps = (field: SignUpField) => {
        const error = errorFor(field);
        return {
            id: field,
            name: field,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? `${field}-error` : undefined,
        };
    };

    return (
        <form action={formAction} noValidate>
            <input type="hidden" name="locale" value={locale} />
            <FieldGroup>
                <Field data-invalid={!!errorFor('name')}>
                    <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
                    <Input
                        {...fieldProps('name')}
                        autoComplete="name"
                        defaultValue={state.values?.name}
                        required
                    />
                    <FieldError id="name-error">{errorFor('name')}</FieldError>
                </Field>

                <Field data-invalid={!!errorFor('email')}>
                    <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                    <Input
                        {...fieldProps('email')}
                        type="email"
                        autoComplete="email"
                        defaultValue={state.values?.email}
                        required
                    />
                    <FieldError id="email-error">
                        {errorFor('email')}
                    </FieldError>
                </Field>

                <Field data-invalid={!!errorFor('password')}>
                    <FieldLabel htmlFor="password">{t('password')}</FieldLabel>
                    <Input
                        {...fieldProps('password')}
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                    {errorFor('password') ? (
                        <FieldError id="password-error">
                            {errorFor('password')}
                        </FieldError>
                    ) : (
                        <FieldDescription>{t('passwordHint')}</FieldDescription>
                    )}
                </Field>

                <Field data-invalid={!!errorFor('confirmPassword')}>
                    <FieldLabel htmlFor="confirmPassword">
                        {t('confirmPassword')}
                    </FieldLabel>
                    <Input
                        {...fieldProps('confirmPassword')}
                        type="password"
                        autoComplete="new-password"
                        required
                    />
                    <FieldError id="confirmPassword-error">
                        {errorFor('confirmPassword')}
                    </FieldError>
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

                <Button type="submit" size="lg" disabled={pending}>
                    {pending ? t('submitting') : t('submit')}
                </Button>
            </FieldGroup>
        </form>
    );
}
