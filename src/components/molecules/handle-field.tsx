import { CheckIcon, LoaderIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/atoms/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from '@/components/atoms/input-group';
import type { HandleStatus } from '@/hooks/use-handle-availability';

export interface HandleFieldProps {
    value: string;
    onChange: (value: string) => void;
    /** Live availability, from useHandleAvailability. */
    status: HandleStatus;
    /** Already-translated error from the last submit. */
    error?: string;
    /**
     * Editing, when this person can't change the handle (or can't yet):
     * the field is read-only and this explains why. Already translated.
     */
    lockedReason?: string;
    /** `handle` (a group's /organization/ address, default) or `username` (a person's /comrade/ address). */
    kind?: 'handle' | 'username';
}

const reasonKey = {
    tooShort: 'handleTooShort',
    tooLong: 'handleTooLong',
    format: 'handleFormat',
    reserved: 'handleReserved',
    taken: 'handleTaken',
} as const;

/** The handle input with the address prefix and a live available / taken note. */
export function HandleField({
    value,
    onChange,
    status,
    error,
    lockedReason,
    kind = 'handle',
}: HandleFieldProps) {
    const t = useTranslations('Organizations');
    const tu = useTranslations('Profile.username');
    const user = kind === 'username';
    const prefix = user
        ? 'communalists.com/comrade/'
        : 'communalists.com/organization/';
    const id = user ? 'username' : 'handle';
    const live =
        status.state === 'unavailable'
            ? user
                ? tu(`errors.${status.reason}`)
                : t(`errors.${reasonKey[status.reason]}`)
            : undefined;
    const shownError = error ?? live;

    return (
        <Field data-invalid={!!shownError}>
            <FieldLabel htmlFor={id}>
                {user ? tu('label') : t('form.handle')}
            </FieldLabel>
            <InputGroup>
                <InputGroupAddon>
                    <InputGroupText>{prefix}</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                    id={id}
                    name={id}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={30}
                    aria-invalid={shownError ? true : undefined}
                    aria-describedby={`${id}-status`}
                    readOnly={!!lockedReason}
                    required
                />
                <InputGroupAddon align="inline-end" aria-hidden>
                    {status.state === 'checking' && (
                        <LoaderIcon className="animate-spin" />
                    )}
                    {status.state === 'available' && !error && (
                        <CheckIcon className="text-emerald-600 dark:text-emerald-400" />
                    )}
                    {(status.state === 'unavailable' || error) && <XIcon />}
                </InputGroupAddon>
            </InputGroup>
            <div id={`${id}-status`} aria-live="polite">
                {shownError ? (
                    <FieldError>{shownError}</FieldError>
                ) : lockedReason ? (
                    <FieldDescription>{lockedReason}</FieldDescription>
                ) : status.state === 'current' ? (
                    <FieldDescription>
                        {t('form.handleCurrent')}
                    </FieldDescription>
                ) : status.state === 'available' ? (
                    <FieldDescription>
                        {user ? tu('available') : t('form.handleAvailable')}
                    </FieldDescription>
                ) : (
                    <FieldDescription>
                        {user ? tu('hint') : t('form.handleHint')}
                    </FieldDescription>
                )}
            </div>
        </Field>
    );
}
