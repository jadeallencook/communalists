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
import { LinkProblem } from '@/components/molecules/link-problem';
import type {
    ResetPasswordField,
    ResetPasswordState,
} from '@/lib/validation/reset-password';

export interface ResetPasswordFormProps {
    /** Result of the last submit. `linkExpired` replaces the form with a "request a new link" message. */
    state: ResetPasswordState;
    /** In the app, the resetPassword server action via useResetPasswordForm. */
    formAction: (formData: FormData) => void | Promise<void>;
    pending?: boolean;
    locale: string;
    /** The one-time code from the emailed link. */
    oobCode: string;
    /** The account's email, filled in for password managers. */
    email: string;
}

/** New password twice, with inline errors. No logic: it renders `state`. */
export function ResetPasswordForm({
    state,
    formAction,
    pending = false,
    locale,
    oobCode,
    email,
}: ResetPasswordFormProps) {
    const t = useTranslations('ResetPassword');

    if (state.linkExpired) return <LinkProblem reason="expired" />;

    const errorFor = (field: ResetPasswordField) => {
        const key = state.fieldErrors?.[field];
        return key ? t(`errors.${key}`) : undefined;
    };
    const fieldProps = (field: ResetPasswordField) => {
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
            <input type="hidden" name="oobCode" value={oobCode} />
            {/* Lets password managers save the new password for this account. */}
            <input
                type="email"
                name="username"
                autoComplete="username"
                value={email}
                readOnly
                hidden
            />
            <FieldGroup>
                <Field data-invalid={!!errorFor('password')}>
                    <FieldLabel htmlFor="password">
                        {t('newPassword')}
                    </FieldLabel>
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

                {state.formError && (
                    <p role="alert" className="text-sm text-destructive">
                        {t(`errors.${state.formError}`)}
                    </p>
                )}

                <p className="text-sm text-muted-foreground">
                    {t('signOutNote')}
                </p>

                <Button type="submit" size="lg" disabled={pending}>
                    {pending ? t('submitting') : t('submit')}
                </Button>
            </FieldGroup>
        </form>
    );
}
