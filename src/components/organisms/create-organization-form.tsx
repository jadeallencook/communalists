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
import { HandleField } from '@/components/molecules/handle-field';
import {
    LocationField,
    type LocationFieldProps,
} from '@/components/molecules/location-field';
import {
    SocialLinksField,
    type SocialLink,
} from '@/components/molecules/social-links-field';
import type { HandleStatus } from '@/hooks/use-handle-availability';
import {
    DEFAULT_MEMBER_LIST_VISIBILITY,
    JOIN_POLICIES,
    MEMBER_LIST_VISIBILITIES,
    MAX_FOCUS_AREAS,
    OFFERED_FOCUS_AREAS,
    RADIUS_MILES,
    REACH_SCOPES,
    VISIBILITIES,
    type ReachScope,
} from '@/lib/organizations/options';
import type {
    CreateOrganizationState,
    OrganizationField,
} from '@/lib/validation/organization';

export interface CreateOrganizationFormProps {
    state: CreateOrganizationState;
    /** In the app, createOrganizationAction via useCreateOrganizationForm. */
    formAction: (formData: FormData) => void | Promise<void>;
    pending?: boolean;
    /** UI locale, sent so the server answers in it. */
    locale: string;
    /** Controlled, so the handle can be suggested from it. */
    name: string;
    onNameChange: (name: string) => void;
    handle: string;
    onHandleChange: (handle: string) => void;
    handleStatus: HandleStatus;
    /** Controlled, so boxes past the cap can be disabled. */
    focusAreas: string[];
    onFocusAreasChange: (focusAreas: string[]) => void;
    /** Controlled, so the radius shows only for local groups. */
    reach: ReachScope;
    onReachChange: (reach: ReachScope) => void;
    socials: SocialLink[];
    onSocialsChange: (socials: SocialLink[]) => void;
    /** The city picker, from useLocationPicker. */
    location: Omit<LocationFieldProps, 'error' | 'hint'>;
    /** Languages a group can choose, already named in the UI language. */
    languageOptions: { value: string; label: string }[];
    /** `edit`: "Save changes", plus `orgId` sent with the form. Default `create`. */
    mode?: 'create' | 'edit';
    /** Editing: the organization being edited. */
    orgId?: string;
    /** Editing, when the handle can't be changed: why (already translated). */
    handleLockedReason?: string;
    /**
     * Super users creating: offer "Add as an unclaimed organization", ticked
     * when `checked`. The server checks they're a super user.
     */
    unclaimedOption?: { checked: boolean };
}

const selectClass =
    'h-8 w-full rounded-lg border border-control bg-transparent px-2.5 text-sm dark:bg-input/30';

/** Everything needed to create (or edit) an organization, in four sections. No logic: it renders `state`. */
export function CreateOrganizationForm({
    state,
    formAction,
    pending = false,
    locale,
    name,
    onNameChange,
    handle,
    onHandleChange,
    handleStatus,
    focusAreas,
    onFocusAreasChange,
    reach,
    onReachChange,
    socials,
    onSocialsChange,
    location,
    languageOptions,
    mode = 'create',
    orgId,
    handleLockedReason,
    unclaimedOption,
}: CreateOrganizationFormProps) {
    const t = useTranslations('Organizations');
    const errorFor = (field: OrganizationField) => {
        const key = state.fieldErrors?.[field];
        return key ? t(`errors.${key}`) : undefined;
    };
    const values = state.values ?? {};
    const section = (title: string) => (
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
    );

    return (
        <form action={formAction} noValidate className="flex flex-col gap-10">
            <input type="hidden" name="uiLocale" value={locale} />
            {orgId && <input type="hidden" name="orgId" value={orgId} />}

            {unclaimedOption && mode === 'create' && (
                <div className="rounded-lg border border-dashed p-4">
                    <ChoiceGroup
                        kind="checkbox"
                        name="unclaimed"
                        legend={t('form.unclaimedLegend')}
                        defaultValue={
                            (values.unclaimed ?? unclaimedOption.checked)
                                ? 'on'
                                : undefined
                        }
                        options={[
                            {
                                value: 'on',
                                label: t('form.unclaimed'),
                                description: t('form.unclaimedHint'),
                            },
                        ]}
                    />
                </div>
            )}

            <FieldGroup>
                {section(t('form.aboutTitle'))}
                <Field data-invalid={!!errorFor('name')}>
                    <FieldLabel htmlFor="name">{t('form.name')}</FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        value={name}
                        onChange={(event) => onNameChange(event.target.value)}
                        maxLength={80}
                        aria-invalid={errorFor('name') ? true : undefined}
                        required
                    />
                    {errorFor('name') ? (
                        <FieldError>{errorFor('name')}</FieldError>
                    ) : (
                        <FieldDescription>
                            {t('form.nameHint')}
                        </FieldDescription>
                    )}
                </Field>

                <HandleField
                    value={handle}
                    onChange={onHandleChange}
                    status={handleStatus}
                    error={errorFor('handle')}
                    lockedReason={handleLockedReason}
                />

                <ChoiceGroup
                    kind="checkbox"
                    name="focusAreas"
                    legend={t('form.focusAreas')}
                    options={OFFERED_FOCUS_AREAS.map((area) => ({
                        value: area,
                        label: t(`focusAreas.${area}`),
                    }))}
                    selected={focusAreas}
                    onSelectedChange={onFocusAreasChange}
                    max={MAX_FOCUS_AREAS}
                    hint={t('form.focusAreasHint', { max: MAX_FOCUS_AREAS })}
                    error={
                        state.fieldErrors?.focusAreas
                            ? t(`errors.${state.fieldErrors.focusAreas}`, {
                                  max: MAX_FOCUS_AREAS,
                              })
                            : undefined
                    }
                    columns
                />

                <Field data-invalid={!!errorFor('description')}>
                    <FieldLabel htmlFor="description">
                        {t('form.description')}
                    </FieldLabel>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={values.description}
                        maxLength={2000}
                        rows={5}
                        aria-invalid={
                            errorFor('description') ? true : undefined
                        }
                    />
                    {errorFor('description') ? (
                        <FieldError>{errorFor('description')}</FieldError>
                    ) : (
                        <FieldDescription>
                            {t('form.descriptionHint')}
                        </FieldDescription>
                    )}
                </Field>
            </FieldGroup>

            <FieldGroup>
                {section(t('form.whereTitle'))}
                <LocationField
                    {...location}
                    hint={t('form.locationHint')}
                    error={errorFor('placeId') ?? errorFor('country')}
                />
                <ChoiceGroup
                    kind="radio"
                    name="reach"
                    legend={t('form.reach')}
                    value={reach}
                    onChange={(value) => onReachChange(value as typeof reach)}
                    options={REACH_SCOPES.map((scope) => ({
                        value: scope,
                        label: t(`reach.${scope}.label`),
                        description: t(`reach.${scope}.description`),
                    }))}
                    error={errorFor('reach')}
                />
                {reach === 'local' && (
                    <Field data-invalid={!!errorFor('radiusMiles')}>
                        <FieldLabel htmlFor="radiusMiles">
                            {t('form.radius')}
                        </FieldLabel>
                        <select
                            id="radiusMiles"
                            name="radiusMiles"
                            defaultValue={values.radiusMiles || '25'}
                            className={selectClass}
                        >
                            {RADIUS_MILES.map((miles) => (
                                <option key={miles} value={miles}>
                                    {t('form.radiusOption', { miles })}
                                </option>
                            ))}
                        </select>
                        <FieldError>{errorFor('radiusMiles')}</FieldError>
                    </Field>
                )}
                <ChoiceGroup
                    kind="checkbox"
                    name="languages"
                    legend={t('form.languages')}
                    options={languageOptions}
                    defaultValue={values.languages ?? [locale]}
                    hint={t('form.languagesHint')}
                    error={errorFor('languages')}
                    columns
                />
            </FieldGroup>

            <FieldGroup>
                {section(t('form.joiningTitle'))}
                <ChoiceGroup
                    kind="radio"
                    name="joinPolicy"
                    legend={t('form.joinPolicy')}
                    defaultValue={values.joinPolicy ?? 'request'}
                    options={JOIN_POLICIES.map((policy) => ({
                        value: policy,
                        label: t(`joinPolicies.${policy}.label`),
                        description: t(`joinPolicies.${policy}.description`),
                    }))}
                    error={errorFor('joinPolicy')}
                />
                <ChoiceGroup
                    kind="radio"
                    name="visibility"
                    legend={t('form.visibility')}
                    defaultValue={values.visibility ?? 'listed'}
                    options={VISIBILITIES.map((visibility) => ({
                        value: visibility,
                        label: t(`visibilities.${visibility}.label`),
                        description: t(
                            `visibilities.${visibility}.description`
                        ),
                    }))}
                    error={errorFor('visibility')}
                />
                <ChoiceGroup
                    kind="radio"
                    name="memberListVisibility"
                    legend={t('form.memberList')}
                    defaultValue={
                        values.memberListVisibility ??
                        DEFAULT_MEMBER_LIST_VISIBILITY
                    }
                    options={MEMBER_LIST_VISIBILITIES.map((setting) => ({
                        value: setting,
                        label: t(`memberLists.${setting}.label`),
                        description: t(`memberLists.${setting}.description`),
                    }))}
                    hint={t('form.memberListHint')}
                    error={errorFor('memberListVisibility')}
                />
            </FieldGroup>

            <FieldGroup>
                {section(t('form.linksTitle'))}
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
                        defaultValue={values.website}
                        aria-invalid={errorFor('website') ? true : undefined}
                    />
                    {errorFor('website') ? (
                        <FieldError>{errorFor('website')}</FieldError>
                    ) : (
                        <FieldDescription>
                            {t('form.websiteHint')}
                        </FieldDescription>
                    )}
                </Field>
                <Field data-invalid={!!errorFor('contactEmail')}>
                    <FieldLabel htmlFor="contactEmail">
                        {t('form.contactEmail')}
                    </FieldLabel>
                    <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        defaultValue={values.contactEmail}
                        aria-invalid={
                            errorFor('contactEmail') ? true : undefined
                        }
                    />
                    {errorFor('contactEmail') ? (
                        <FieldError>{errorFor('contactEmail')}</FieldError>
                    ) : (
                        <FieldDescription>
                            {t('form.contactEmailHint')}
                        </FieldDescription>
                    )}
                </Field>
                <SocialLinksField
                    links={socials}
                    onChange={onSocialsChange}
                    error={errorFor('socials')}
                />
            </FieldGroup>

            {state.formError && (
                <p role="alert" className="text-sm text-destructive">
                    {t(`errors.${state.formError}`)}
                </p>
            )}

            <Button type="submit" size="lg" disabled={pending}>
                {mode === 'edit'
                    ? pending
                        ? t('form.saving')
                        : t('form.save')
                    : pending
                      ? t('form.submitting')
                      : t('form.submit')}
            </Button>
        </form>
    );
}
