'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';

import type { SocialLink } from '@/components/molecules/social-links-field';
import { CreateOrganizationForm } from '@/components/organisms/create-organization-form';
import { useCreateOrganizationForm } from '@/hooks/use-create-organization-form';
import { useHandleAvailability } from '@/hooks/use-handle-availability';
import { useLocationPicker } from '@/hooks/use-location-picker';
import { languageName } from '@/lib/organizations/client';
import { suggestHandle } from '@/lib/organizations/handle';
import { ORG_LANGUAGES, type ReachScope } from '@/lib/organizations/options';
import type { CountryCode, PlaceOption } from '@/lib/places/types';

import { createOrganizationAction } from './actions';

/**
 * Wires the create form: the action, a handle suggested from the name (until
 * the person edits the handle), live handle checks, the city picker
 * (starting at the user's own city), focus areas, reach and social links.
 */
export function CreateOrganizationFormContainer({
    country,
    place,
}: {
    country?: CountryCode;
    place?: PlaceOption | null;
}) {
    const locale = useLocale();
    const { state, formAction, pending } = useCreateOrganizationForm(
        createOrganizationAction
    );
    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [handleEdited, setHandleEdited] = useState(false);
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [reach, setReach] = useState<ReachScope>('local');
    const [socials, setSocials] = useState<SocialLink[]>([]);
    const handleStatus = useHandleAvailability(handle);
    const location = useLocationPicker({ locale, country, selected: place });

    return (
        <CreateOrganizationForm
            state={state}
            formAction={formAction}
            pending={pending}
            locale={locale}
            name={name}
            onNameChange={(next) => {
                setName(next);
                if (!handleEdited) setHandle(suggestHandle(next));
            }}
            handle={handle}
            onHandleChange={(next) => {
                setHandleEdited(next !== '');
                setHandle(next);
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
