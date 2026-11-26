import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';
import { Link } from '@/i18n/navigation';
import type { SignInField, SignInState } from '@/lib/validation/sign-in';
import { track } from '@/lib/analytics';

export interface SignInFormProps {
    /** Result of the last submit: field errors, form error, and the email to restore. */
    state: SignInState;
    /** What the form submits to. In the app, the signIn server action via useSignInForm. */
    formAction: (formData: FormData) => void | Promise<void>;
    pending?: boolean;
    /** Sent with the form so the server can answer in the right language. */
    locale: string;
}

/** Email and password with inline errors and a forgot-password link. No logic: it renders `state`. */
export function SignInForm({
    state,
    formAction,
    pending = false,
    locale,
}: SignInFormProps) {
    const t = useTranslations('SignIn');

    const errorFor = (field: SignInField) => {
        const key = state.fieldErrors?.[field];
        return key ? t(`errors.${key}`) : undefined;
    };
    const fieldProps = (field: SignInField) => {
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
                    <div className="flex items-center justify-between gap-2">
                        <FieldLabel htmlFor="password">
                            {t('password')}
                        </FieldLabel>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                    <Input
                        {...fieldProps('password')}
                        type="password"
                        autoComplete="current-password"
                        required
                    />
                    <FieldError id="password-error">
                        {errorFor('password')}
                    </FieldError>
                </Field>

                {state.formError && (
                    <p role="alert" className="text-sm text-destructive">
                        {t(`errors.${state.formError}`)}
                    </p>
                )}

                <Button
                    type="submit"
                    size="lg"
                    disabled={pending}
                    {...track('sign-in-submit')}
                >
                    {pending ? t('submitting') : t('submit')}
                </Button>
            </FieldGroup>
        </form>
    );
}
