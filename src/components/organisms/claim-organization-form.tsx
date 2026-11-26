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
import { Textarea } from '@/components/atoms/textarea';
import { ChoiceGroup } from '@/components/molecules/choice-group';
import {
    CLAIM_INTENTS,
    CLAIM_MESSAGE_MAX,
    CLAIM_MESSAGE_MIN,
    CLAIM_ROLE_MAX,
    type ClaimErrorKey,
    type ClaimField,
} from '@/lib/organizations/claims';
import { track } from '@/lib/analytics';

export type ClaimFormErrorKey = 'notUnclaimed' | 'alreadyPending' | 'generic';

export interface ClaimFormState {
    fieldErrors?: Partial<Record<ClaimField, ClaimErrorKey>>;
    formError?: ClaimFormErrorKey;
    /** Echoed back so the form keeps what was typed. */
    values?: Partial<Record<ClaimField, string>>;
}

export interface ClaimOrganizationFormProps {
    /** The organization's name, for the labels. */
    name: string;
    orgId: string;
    handle: string;
    /** UI locale, sent so the server answers in it. */
    locale: string;
    state: ClaimFormState;
    /** In the app, submitClaimAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
}

/** Ask to claim an unclaimed organization, or to take its page down. No logic: it renders `state`. */
export function ClaimOrganizationForm({
    name,
    orgId,
    handle,
    locale,
    state,
    formAction,
    pending = false,
}: ClaimOrganizationFormProps) {
    const t = useTranslations('Claim');
    const values = state.values ?? {};
    const errorFor = (field: ClaimField) => {
        const key = state.fieldErrors?.[field];
        return key
            ? t(`errors.${key}`, {
                  min: CLAIM_MESSAGE_MIN,
                  max: field === 'role' ? CLAIM_ROLE_MAX : CLAIM_MESSAGE_MAX,
              })
            : undefined;
    };

    return (
        <form action={formAction} noValidate className="flex flex-col gap-8">
            <input type="hidden" name="orgId" value={orgId} />
            <input type="hidden" name="handle" value={handle} />
            <input type="hidden" name="locale" value={locale} />
            <FieldGroup>
                <ChoiceGroup
                    kind="radio"
                    name="intent"
                    legend={t('intent')}
                    defaultValue={values.intent ?? 'claim'}
                    options={CLAIM_INTENTS.map((intent) => ({
                        value: intent,
                        label: t(`intents.${intent}.label`),
                        description: t(`intents.${intent}.description`),
                    }))}
                    error={errorFor('intent')}
                />

                <Field data-invalid={!!errorFor('role')}>
                    <FieldLabel htmlFor="claim-role">
                        {t('role', { name })}
                    </FieldLabel>
                    <Input
                        id="claim-role"
                        name="role"
                        defaultValue={values.role}
                        maxLength={CLAIM_ROLE_MAX}
                        aria-invalid={errorFor('role') ? true : undefined}
                        aria-describedby="claim-role-hint"
                        required
                    />
                    {errorFor('role') ? (
                        <FieldError id="claim-role-hint">
                            {errorFor('role')}
                        </FieldError>
                    ) : (
                        <FieldDescription id="claim-role-hint">
                            {t('roleHint')}
                        </FieldDescription>
                    )}
                </Field>

                <Field data-invalid={!!errorFor('message')}>
                    <FieldLabel htmlFor="claim-message">
                        {t('message')}
                    </FieldLabel>
                    <Textarea
                        id="claim-message"
                        name="message"
                        defaultValue={values.message}
                        maxLength={CLAIM_MESSAGE_MAX}
                        rows={5}
                        aria-invalid={errorFor('message') ? true : undefined}
                        aria-describedby="claim-message-hint"
                        required
                    />
                    {errorFor('message') ? (
                        <FieldError id="claim-message-hint">
                            {errorFor('message')}
                        </FieldError>
                    ) : (
                        <FieldDescription id="claim-message-hint">
                            {t('messageHint')}
                        </FieldDescription>
                    )}
                </Field>
            </FieldGroup>

            <p className="rounded-lg bg-muted p-3 text-sm">{t('privacy')}</p>

            {state.formError && (
                <p role="alert" className="text-sm text-destructive">
                    {t(`formErrors.${state.formError}`)}
                </p>
            )}

            <Button
                type="submit"
                size="lg"
                disabled={pending}
                {...track('org-claim-submit', { org: handle })}
            >
                {pending ? t('submitting') : t('submit')}
            </Button>
        </form>
    );
}
