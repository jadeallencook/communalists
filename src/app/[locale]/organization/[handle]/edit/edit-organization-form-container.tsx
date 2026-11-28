'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import type { SocialLink } from '@/components/molecules/social-links-field';
import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { useCreateOrganizationForm } from '@/hooks/use-create-organization-form';
import { useHandleAvailability } from '@/hooks/use-handle-availability';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { languageName } from '@/lib/organizations/client';
import { ORG_LANGUAGES, type ReachScope } from '@/lib/organizations/options';
import type { CountryCode, PlaceOption } from '@/lib/places/types';
import type { CreateOrganizationState } from '@/lib/validation/organization';

import { updateOrganizationAction } from './actions';

export interface EditableOrganization {
    id: string;
    name: string;
    handle: string;
    focusAreas: string[];
    country?: CountryCode;
    place: PlaceOption;
    reach: ReachScope;
    socials: SocialLink[];
    /** Everything else, as the form's starting values. */
    values: NonNullable<CreateOrganizationState['values']>;
}

/**
 * Wires the edit form: the same form as creating, filled in with the
 * organization, saved by updateOrganizationAction. The handle check treats
 * the current handle as fine; `handleLockedReason` makes it read-only.
 */
export function EditOrganizationFormContainer({
    org,
    handleLockedReason,
}: {
    org: EditableOrganization;
    handleLockedReason?: string;
}) {
    const locale = useLocale();
    const { state, formAction, pending } = useCreateOrganizationForm(
        updateOrganizationAction,
        { values: org.values }
    );
    const [name, setName] = useState(org.name);
    const [handle, setHandle] = useState(org.handle);
    const [focusAreas, setFocusAreas] = useState<string[]>(org.focusAreas);
    const [reach, setReach] = useState<ReachScope>(org.reach);
    const [socials, setSocials] = useState<SocialLink[]>(org.socials);
    const handleStatus = useHandleAvailability(handle, {
        current: org.handle,
    });
    const location = useLocationPicker({
        locale,
        country: org.country,
        selected: org.place,
    });

    return (
        <CreateOrganizationForm
            mode="edit"
            orgId={org.id}
            handleLockedReason={handleLockedReason}
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            name={name}
            onNameChange={setName}
            handle={handle}
            onHandleChange={(next) => {
                if (!handleLockedReason) setHandle(next);
            }}
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
