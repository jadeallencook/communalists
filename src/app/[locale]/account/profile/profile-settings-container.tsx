'use client';

import { useLocale } from 'next-intl';
import { useActionState, useState } from 'react';

import {
    ProfilePreview,
    type PreviewAudience,
} from '@/components/organisms/profile-preview';
import {
    ProfileSettingsForm,
    type ProfileFormValue,
} from '@/components/organisms/profile-settings-form';
import { ProfileSettingsPage } from '@/components/pages/profile-settings-page';
import { languageName } from '@/lib/organizations/client';
import { ORG_LANGUAGES, type OrgLanguage } from '@/lib/organizations/options';
import {
    profileView,
    type ProfileGroup,
    type ProfileSettings,
} from '@/lib/profiles';
import type { ProfileSettingsState } from '@/lib/validation/profile';

import { PhotoEditorContainer } from '../../_photos/photo-editor-container';
import { saveProfileSettingsAction } from './actions';

/**
 * Wires /account/profile: the form (controlled), the save action, and a live
 * "Preview as…" built with the same rules the profile page uses.
 */
export function ProfileSettingsContainer({
    name,
    username,
    areaLabel,
    photo,
    settings,
    groups,
}: {
    name: string;
    username: string;
    areaLabel: string;
    /** The current photo's large link. */
    photo?: string;
    settings: ProfileSettings;
    groups: ProfileGroup[];
}) {
    const locale = useLocale();
    const [state, formAction, pending] = useActionState<
        ProfileSettingsState,
        FormData
    >(saveProfileSettingsAction, {});
    const [value, setValue] = useState<ProfileFormValue>({
        visibility: settings.visibility,
        pronouns: settings.pronouns ?? '',
        bio: settings.bio ?? '',
        languages: settings.languages,
        showArea: settings.showArea,
        website: settings.website ?? '',
        socials: settings.socials,
        groupsShow: settings.groups.show,
        shownGroups: groups
            .map((g) => g.orgId)
            .filter((id) => !settings.groups.hidden.includes(id)),
    });
    const [audience, setAudience] = useState<PreviewAudience>('groupmate');

    // What the form would save, for the preview (links aren't validated yet).
    const draft: ProfileSettings = {
        visibility: value.visibility,
        pronouns: value.pronouns.trim() || undefined,
        bio: value.bio.trim() || undefined,
        languages: value.languages as OrgLanguage[],
        showArea: value.showArea,
        website: value.website.trim() || undefined,
        socials: value.socials.filter((s) => s.handle.trim()),
        groups: {
            show: value.groupsShow,
            hidden: groups
                .map((g) => g.orgId)
                .filter((id) => !value.shownGroups.includes(id)),
        },
    };
    const person = {
        name,
        username,
        areaLabel,
        photo,
        settings: draft,
        groups,
    };
    const none = new Set<string>();

    return (
        <ProfileSettingsPage
            username={username}
            photo={<PhotoEditorContainer name={name} photo={photo} />}
            form={
                <ProfileSettingsForm
                    value={value}
                    onChange={setValue}
                    state={state}
                    formAction={formAction}
                    pending={pending}
                    areaLabel={areaLabel}
                    groups={groups.map(({ orgId, name: groupName }) => ({
                        orgId,
                        name: groupName,
                    }))}
                    languageOptions={ORG_LANGUAGES.map((code) => ({
                        value: code,
                        label: languageName(code, locale),
                    }))}
                />
            }
            preview={
                <ProfilePreview
                    audience={audience}
                    onAudienceChange={setAudience}
                    views={{
                        public: profileView(person, 'public', none),
                        groupmate: profileView(person, 'groupmate', none),
                        signedIn: profileView(person, 'signedIn', none),
                    }}
                />
            }
        />
    );
}
