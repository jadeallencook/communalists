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
}: HandleFieldProps) {
    const t = useTranslations('Organizations');
    const live =
        status.state === 'unavailable'
            ? t(`errors.${reasonKey[status.reason]}`)
            : undefined;
    const shownError = error ?? live;

    return (
        <Field data-invalid={!!shownError}>
            <FieldLabel htmlFor="handle">{t('form.handle')}</FieldLabel>
            <InputGroup>
                <InputGroupAddon>
                    <InputGroupText>communalists.com/org/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                    id="handle"
                    name="handle"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={30}
                    aria-invalid={shownError ? true : undefined}
                    aria-describedby="handle-status"
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
            <div id="handle-status" aria-live="polite">
                {shownError ? (
                    <FieldError>{shownError}</FieldError>
                ) : status.state === 'available' ? (
                    <FieldDescription>
                        {t('form.handleAvailable')}
                    </FieldDescription>
                ) : (
                    <FieldDescription>{t('form.handleHint')}</FieldDescription>
                )}
            </div>
        </Field>
    );
}
