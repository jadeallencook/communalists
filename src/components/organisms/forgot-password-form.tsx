import { MailCheckIcon } from 'lucide-react';
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
import type { ForgotPasswordState } from '@/lib/validation/forgot-password';

export interface ForgotPasswordFormProps {
    /** Result of the last submit. Once `sent`, shows a confirmation instead of the form. */
    state: ForgotPasswordState;
    /** In the app, the requestPasswordReset server action via useForgotPasswordForm. */
    formAction: (formData: FormData) => void | Promise<void>;
    pending?: boolean;
    /** Sent with the form so the email arrives in the right language. */
    locale: string;
}

/** Asks for an email, then confirms the reset link is on its way. No logic: it renders `state`. */
export function ForgotPasswordForm({
    state,
    formAction,
    pending = false,
    locale,
}: ForgotPasswordFormProps) {
    const t = useTranslations('ForgotPassword');
    const emailError = state.fieldErrors?.email
        ? t(`errors.${state.fieldErrors.email}`)
        : undefined;

    if (state.sent) {
        return (
            <div role="status" className="flex flex-col items-start gap-3">
                <MailCheckIcon aria-hidden className="size-6" />
                <p className="font-medium">{t('sentTitle')}</p>
                <p className="text-sm text-muted-foreground">
                    {t('sentBody', { email: state.values?.email ?? '' })}
                </p>
            </div>
        );
    }

    return (
        <form action={formAction} noValidate>
            <input type="hidden" name="locale" value={locale} />
            <FieldGroup>
                <Field data-invalid={!!emailError}>
                    <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        defaultValue={state.values?.email}
                        aria-invalid={emailError ? true : undefined}
                        aria-describedby={
                            emailError ? 'email-error' : 'email-hint'
                        }
                        required
                    />
                    {emailError ? (
                        <FieldError id="email-error">{emailError}</FieldError>
                    ) : (
                        <FieldDescription id="email-hint">
                            {t('hint')}
                        </FieldDescription>
                    )}
                </Field>

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
