import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/atoms/field';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { ChoiceGroup } from '@/components/molecules/choice-group';
import { Link } from '@/i18n/navigation';
import { organizationPath } from '@/lib/paths';
import {
    SocialLinksField,
    type SocialLink,
} from '@/components/molecules/social-links-field';
import {
    BIO_MAX,
    COMRADE_REQUEST_SETTINGS,
    PRONOUNS_MAX,
    PROFILE_VISIBILITIES,
    type ComradeRequestSetting,
    type ProfileVisibility,
} from '@/lib/profiles';
import type {
    ProfileSettingsField,
    ProfileSettingsState,
} from '@/lib/validation/profile';

/** The form's current values (controlled, so the preview follows along). */
export interface ProfileFormValue {
    visibility: ProfileVisibility;
    pronouns: string;
    bio: string;
    languages: string[];
    showArea: boolean;
    website: string;
    socials: SocialLink[];
    groupsShow: boolean;
    /** Organization ids ticked "show on my profile". */
    shownGroups: string[];
    /** Show the organizations they endorse. */
    endorsementsShow: boolean;
    /** Show their comrades. */
    comradesShow: boolean;
    /** Who may send them comrade requests. */
    comradeRequests: ComradeRequestSetting;
}

export interface ProfileSettingsFormProps {
    value: ProfileFormValue;
    onChange: (value: ProfileFormValue) => void;
    state: ProfileSettingsState;
    /** In the app, saveProfileSettingsAction via useActionState. */
    formAction: (formData: FormData) => void;
    pending?: boolean;
    /** Their saved city, named in the "show my city" option. */
    areaLabel: string;
    /** Groups they're in, for choosing which to show. */
    groups: { orgId: string; name: string }[];
    /**
     * Organizations they endorse, linked to each page (where they can take
     * it back). Null when they couldn't be loaded.
     */
    endorsements: { orgId: string; name: string; handle: string }[] | null;
    /** Languages, already named in the UI language. */
    languageOptions: { value: string; label: string }[];
}

const checkboxRow =
    'flex cursor-pointer items-start gap-2 rounded-lg border border-control p-2.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring';

/**
 * What a person shares on their profile, and with whom. Everything is
 * optional and starts empty. No logic: it renders `value` and `state`.
 */
export function ProfileSettingsForm({
    value,
    onChange,
    state,
    formAction,
    pending = false,
    areaLabel,
    groups,
    endorsements,
    languageOptions,
}: ProfileSettingsFormProps) {
    const t = useTranslations('Profile');
    const set = (patch: Partial<ProfileFormValue>) =>
        onChange({ ...value, ...patch });
    const errorFor = (field: ProfileSettingsField) => {
        const key = state.fieldErrors?.[field];
        return key ? t(`errors.${key}`) : undefined;
    };

    return (
        <form action={formAction} noValidate className="flex flex-col gap-10">
            <FieldGroup>
                <ChoiceGroup
                    kind="radio"
                    name="visibility"
                    legend={t('form.visibility')}
                    value={value.visibility}
                    onChange={(v) =>
                        set({ visibility: v as ProfileVisibility })
                    }
                    options={PROFILE_VISIBILITIES.map((level) => ({
                        value: level,
                        label: t(`visibilities.${level}.label`),
                        description: t(`visibilities.${level}.description`),
                    }))}
                    hint={t('form.visibilityHint')}
                />
            </FieldGroup>

            <FieldGroup>
                <h2 className="font-heading text-lg font-semibold">
                    {t('form.aboutTitle')}
                </h2>
                <Field data-invalid={!!errorFor('pronouns')}>
                    <FieldLabel htmlFor="pronouns">
                        {t('form.pronouns')}
                    </FieldLabel>
                    <Input
                        id="pronouns"
                        name="pronouns"
                        value={value.pronouns}
                        onChange={(e) => set({ pronouns: e.target.value })}
                        maxLength={PRONOUNS_MAX}
                        aria-invalid={errorFor('pronouns') ? true : undefined}
                        aria-describedby="pronouns-hint"
                    />
                    {errorFor('pronouns') ? (
                        <FieldError>{errorFor('pronouns')}</FieldError>
                    ) : (
                        <FieldDescription id="pronouns-hint">
                            {t('form.pronounsHint')}
                        </FieldDescription>
                    )}
                </Field>
                <Field data-invalid={!!errorFor('bio')}>
                    <FieldLabel htmlFor="bio">{t('form.bio')}</FieldLabel>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={value.bio}
                        onChange={(e) => set({ bio: e.target.value })}
                        maxLength={BIO_MAX}
                        rows={4}
                        aria-invalid={errorFor('bio') ? true : undefined}
                        aria-describedby="bio-hint"
                    />
                    {errorFor('bio') ? (
                        <FieldError>{errorFor('bio')}</FieldError>
                    ) : (
                        <FieldDescription id="bio-hint">
                            {t('form.bioHint', {
                                left: BIO_MAX - value.bio.length,
                            })}
                        </FieldDescription>
                    )}
                </Field>
                <ChoiceGroup
                    kind="checkbox"
                    name="languages"
                    legend={t('form.languages')}
                    options={languageOptions}
                    selected={value.languages}
                    onSelectedChange={(languages) => set({ languages })}
                    hint={t('form.languagesHint')}
                    columns
                />
                <label className={checkboxRow}>
                    <input
                        type="checkbox"
                        name="showArea"
                        checked={value.showArea}
                        onChange={(e) => set({ showArea: e.target.checked })}
                        className="mt-0.5 accent-primary"
                    />
                    <span className="flex flex-col gap-0.5">
                        <span>{t('form.showArea', { city: areaLabel })}</span>
                        <span className="text-xs text-muted-foreground">
                            {t('form.showAreaHint')}
                        </span>
                    </span>
                </label>
            </FieldGroup>

            <FieldGroup>
                <h2 className="font-heading text-lg font-semibold">
                    {t('form.linksTitle')}
                </h2>
                <Field data-invalid={!!errorFor('website')}>
                    <FieldLabel htmlFor="website">
                        {t('form.website')}
                    </FieldLabel>
                    <Input
                        id="website"
                        name="website"
                        type="url"
                        inputMode="url"
                        placeholder="example.org"
                        value={value.website}
                        onChange={(e) => set({ website: e.target.value })}
                        aria-invalid={errorFor('website') ? true : undefined}
                    />
                    {errorFor('website') && (
                        <FieldError>{errorFor('website')}</FieldError>
                    )}
                </Field>
                <SocialLinksField
                    links={value.socials}
                    onChange={(socials) => set({ socials })}
                    error={errorFor('socials')}
                />
            </FieldGroup>

            <FieldSet>
                <FieldLegend className="font-heading text-lg font-semibold">
                    {t('form.groupsTitle')}
                </FieldLegend>
                <FieldDescription>{t('form.groupsHint')}</FieldDescription>
                <label className={checkboxRow}>
                    <input
                        type="checkbox"
                        name="groupsShow"
                        checked={value.groupsShow}
                        onChange={(e) => set({ groupsShow: e.target.checked })}
                        className="mt-0.5 accent-primary"
                    />
                    <span>{t('form.groupsShow')}</span>
                </label>
                {value.groupsShow && groups.length > 0 && (
                    <div className="flex flex-col gap-2 ps-6">
                        {groups.map((group) => (
                            <label key={group.orgId} className={checkboxRow}>
                                <input
                                    type="checkbox"
                                    name="shownGroups"
                                    value={group.orgId}
                                    checked={value.shownGroups.includes(
                                        group.orgId
                                    )}
                                    onChange={(e) =>
                                        set({
                                            shownGroups: e.target.checked
                                                ? [
                                                      ...value.shownGroups,
                                                      group.orgId,
                                                  ]
                                                : value.shownGroups.filter(
                                                      (id) => id !== group.orgId
                                                  ),
                                        })
                                    }
                                    className="mt-0.5 accent-primary"
                                />
                                <span className="break-words">
                                    {group.name}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </FieldSet>

            <FieldSet>
                <FieldLegend className="font-heading text-lg font-semibold">
                    {t('form.endorsementsTitle')}
                </FieldLegend>
                <FieldDescription>
                    {t('form.endorsementsHint')}
                </FieldDescription>
                <label className={checkboxRow}>
                    <input
                        type="checkbox"
                        name="endorsementsShow"
                        checked={value.endorsementsShow}
                        onChange={(e) =>
                            set({ endorsementsShow: e.target.checked })
                        }
                        className="mt-0.5 accent-primary"
                    />
                    <span>{t('form.endorsementsShow')}</span>
                </label>
                {endorsements === null ? (
                    <p role="alert" className="text-sm text-destructive">
                        {t('endorsementsFailed')}
                    </p>
                ) : endorsements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('form.endorsementsNone')}
                    </p>
                ) : (
                    <ul
                        aria-label={t('form.endorsementsList')}
                        className="flex flex-col gap-1 ps-6 text-sm"
                    >
                        {endorsements.map((org) => (
                            <li key={org.orgId}>
                                <Link
                                    href={organizationPath(org.handle)}
                                    className="break-words underline underline-offset-4 hover:decoration-2"
                                >
                                    {org.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </FieldSet>

            <FieldSet>
                <FieldLegend className="font-heading text-lg font-semibold">
                    {t('form.comradesTitle')}
                </FieldLegend>
                <FieldDescription>{t('form.comradesHint')}</FieldDescription>
                <label className={checkboxRow}>
                    <input
                        type="checkbox"
                        name="comradesShow"
                        checked={value.comradesShow}
                        onChange={(e) =>
                            set({ comradesShow: e.target.checked })
                        }
                        className="mt-0.5 accent-primary"
                    />
                    <span>{t('form.comradesShow')}</span>
                </label>
                <ChoiceGroup
                    kind="radio"
                    name="comradeRequests"
                    legend={t('form.comradeRequests')}
                    value={value.comradeRequests}
                    onChange={(v) =>
                        set({ comradeRequests: v as ComradeRequestSetting })
                    }
                    options={COMRADE_REQUEST_SETTINGS.map((option) => ({
                        value: option,
                        label: t(`comradeRequestOptions.${option}.label`),
                        description: t(
                            `comradeRequestOptions.${option}.description`
                        ),
                    }))}
                    hint={t('form.comradeRequestsHint')}
                />
            </FieldSet>

            {state.formError && (
                <p role="alert" className="text-sm text-destructive">
                    {t(`errors.${state.formError}`)}
                </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="lg" disabled={pending}>
                    {pending ? t('form.saving') : t('form.save')}
                </Button>
                <p role="status" className="text-sm text-muted-foreground">
                    {state.saved && !pending ? t('form.saved') : ''}
                </p>
            </div>
        </form>
    );
}
