'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import type { SocialLink } from '@/components/molecules/social-links-field';
import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { useCreateOrganizationForm } from '@/hooks/use-create-organization-form';
import { useHandleAvailability } from '@/hooks/use-handle-availability';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { languageName } from '@/lib/organizations/client';
import {
    formValuesOf,
    valuesFromForm,
    type ImportProblem,
    type ImportValues,
} from '@/lib/organizations/import';
import { ORG_LANGUAGES, type ReachScope } from '@/lib/organizations/options';
import {
    organizationFormValues,
    organizationSchema,
    type CreateOrganizationState,
    type OrganizationErrorKey,
    type OrganizationField,
} from '@/lib/validation/organization';

/** Problems the form can show beside a field (the rest stay on the card). */
const FORM_ERRORS = new Set<string>([
    'required',
    'tooShort',
    'tooLong',
    'handleTooShort',
    'handleTooLong',
    'handleFormat',
    'handleReserved',
    'handleTaken',
    'focusAreasRequired',
    'focusAreasTooMany',
    'placeRequired',
    'placeNotFound',
    'radiusRequired',
    'languagesRequired',
    'invalidUrl',
    'invalidEmail',
    'invalidPhone',
    'invalidYear',
    'socialInvalid',
    'socialMismatch',
    'socialDuplicate',
]);

function fieldErrorsOf(problems: ImportProblem[]) {
    const errors: CreateOrganizationState['fieldErrors'] = {};
    for (const p of problems) {
        if (!FORM_ERRORS.has(p.key)) continue;
        const field = (
            p.column === 'placeLabel' || p.column === 'country'
                ? 'placeId'
                : p.column
        ) as OrganizationField;
        errors[field] ??= p.key as OrganizationErrorKey;
    }
    return errors;
}

/**
 * Edits one import row with the create form, filled in from the row. Saving
 * checks the form's own rules here; the page then checks the row on the
 * server (place, duplicates, already listed).
 */
export function ImportRowEditor({
    values,
    placeLabel,
    problems,
    onSave,
}: {
    values: ImportValues;
    /** The city the row's place ID points at, if it's a real one. */
    placeLabel?: string;
    problems: ImportProblem[];
    onSave: (values: ImportValues) => void;
}) {
    const locale = useLocale();
    const start = formValuesOf(values);
    const location = useLocationPicker({
        locale,
        selected:
            placeLabel && values.placeId
                ? { id: values.placeId, label: placeLabel }
                : null,
    });
    const { state, formAction, pending } = useCreateOrganizationForm(
        async (_prev, formData) => {
            const raw = organizationFormValues(formData);
            const parsed = organizationSchema.safeParse(raw);
            if (!parsed.success) {
                const fieldErrors: CreateOrganizationState['fieldErrors'] = {};
                for (const issue of parsed.error.issues) {
                    const field = issue.path[0] as OrganizationField;
                    fieldErrors[field] ??=
                        issue.message as OrganizationErrorKey;
                }
                return { fieldErrors, values: raw };
            }
            onSave(valuesFromForm(raw, location.selected?.label ?? '', values));
            return { values: raw };
        },
        { values: start, fieldErrors: fieldErrorsOf(problems) }
    );
    const [name, setName] = useState(start.name);
    const [handle, setHandle] = useState(start.handle);
    const [focusAreas, setFocusAreas] = useState<string[]>(start.focusAreas);
    const [reach, setReach] = useState<ReachScope>(
        (['local', 'national', 'international'] as const).includes(
            start.reach as ReachScope
        )
            ? (start.reach as ReachScope)
            : 'local'
    );
    const [socials, setSocials] = useState<SocialLink[]>(
        start.socials as SocialLink[]
    );
    const handleStatus = useHandleAvailability(handle);

    return (
        <CreateOrganizationForm
            mode="edit"
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            name={name}
            onNameChange={setName}
            handle={handle}
            onHandleChange={setHandle}
            handleStatus={handleStatus}
            focusAreas={focusAreas}
            onFocusAreasChange={setFocusAreas}
            reach={reach}
            onReachChange={setReach}
            socials={socials}
            onSocialsChange={setSocials}
            location={location}
            languageOptions={ORG_LANGUAGES.map((code) => ({
                value: code,
                label: languageName(code, locale),
            }))}
        />
    );
}
