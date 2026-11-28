'use client';

import {
    ArrowLeftIcon,
    ArrowRightIcon,
    DownloadIcon,
    ImageIcon,
    Share2Icon,
    Trash2Icon,
    WandSparklesIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

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
import { StepBar } from '@/components/molecules/step-bar';
import { ThumbnailChoice } from '@/components/molecules/thumbnail-choice';
import { Link } from '@/i18n/navigation';
import { localeNames, routing, type Locale } from '@/i18n/routing';
import { track } from '@/lib/analytics';
import {
    CONTENT_LIMITS,
    FORMAT_KEYS,
    GRAPHIC_STEPS,
    LAYOUTS,
    PALETTES,
    PHOTO_FOCUS,
    TEMPLATE_KEYS,
    usesPhoto,
    type ContentField,
    type FormatKey,
    type GraphicContent,
    type GraphicStep,
    type LayoutKey,
    type PaletteKey,
    type PhotoFocus,
    type TemplateKey,
} from '@/lib/graphics';

export interface GraphicEditorProps {
    step: GraphicStep;
    setStep: (step: GraphicStep) => void;
    /** Pictures for the pickers, drawn with the person's words (missing while drawn). */
    thumbnails: {
        templates: Partial<Record<TemplateKey, string>>;
        layouts: Partial<Record<LayoutKey, string>>;
    };
    /** The template's suggestions first, then the rest. */
    layoutChoices: { suggested: LayoutKey[]; rest: LayoutKey[] };
    paletteChoices: { suggested: PaletteKey[]; rest: PaletteKey[] };
    switchToPhotoLayout: () => void;
    /** Width ÷ height of the chosen size, for the pickers' pictures. */
    aspect: number;
    template: TemplateKey;
    setTemplate: (template: TemplateKey) => void;
    format: FormatKey;
    setFormat: (format: FormatKey) => void;
    layout: LayoutKey;
    setLayout: (layout: LayoutKey) => void;
    palette: PaletteKey;
    setPalette: (palette: PaletteKey) => void;
    graphicLocale: Locale;
    setGraphicLocale: (locale: Locale) => void;
    content: GraphicContent;
    setField: (field: ContentField, value: string) => void;
    /** The QR link was typed but isn't a web address. */
    linkInvalid: boolean;
    hasPhoto: boolean;
    pickPhoto: (file: File) => void;
    removePhoto: () => void;
    photoFocus: PhotoFocus;
    setPhotoFocus: (focus: PhotoFocus) => void;
    hasLogo: boolean;
    pickLogo: (file: File) => void;
    removeLogo: () => void;
    /** The last step ends with Save (and Share where the device can). */
    ready: boolean;
    save: () => void;
    share?: () => void;
    /** "Fill in from your organization" (FillFromOrganization), streamed in with the session. */
    fillSlot?: ReactNode;
    /** Shown next to what caused it. */
    error?: 'picture' | 'fill' | 'save' | null;
}

/**
 * The form for a graphic, one step at a time: what it's for, the words,
 * photo and logo, then size, layout, colours and language. People can jump
 * between steps. No logic: it renders its props.
 */
export function GraphicEditor(props: GraphicEditorProps) {
    const t = useTranslations('Graphics');
    const id = useId();
    const headingRef = useRef<HTMLHeadingElement>(null);
    // Focus follows a step change the person made (not the first render).
    const moved = useRef(false);
    useEffect(() => {
        if (moved.current) headingRef.current?.focus();
    }, [props.step]);

    const index = GRAPHIC_STEPS.indexOf(props.step);
    const previous = GRAPHIC_STEPS[index - 1];
    const next = GRAPHIC_STEPS[index + 1];
    const go = (step: GraphicStep) => {
        moved.current = true;
        props.setStep(step);
    };
    const stepLabel = (step: GraphicStep) => t(`steps.${step}`);

    return (
        <div className="flex flex-col gap-6">
            <StepBar
                label={t('steps.label')}
                steps={GRAPHIC_STEPS.map((value) => ({
                    value,
                    label: stepLabel(value),
                }))}
                current={props.step}
                onChange={go}
            />

            <section
                aria-labelledby={`${id}-step`}
                className="flex flex-col gap-6"
            >
                <h2
                    ref={headingRef}
                    id={`${id}-step`}
                    tabIndex={-1}
                    aria-label={t('steps.current', {
                        number: index + 1,
                        total: GRAPHIC_STEPS.length,
                        step: stepLabel(props.step),
                    })}
                    className="font-heading text-xl font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {stepLabel(props.step)}
                </h2>
                {props.step === 'template' && <TemplateStep {...props} />}
                {props.step === 'words' && <WordsStep {...props} />}
                {props.step === 'pictures' && <PicturesStep {...props} />}
                {props.step === 'look' && <LookStep {...props} />}
            </section>

            <div className="flex flex-col gap-3 border-t pt-4">
                {!next && <p className="text-sm">{t('doneHint')}</p>}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    {previous ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => go(previous)}
                        >
                            <ArrowLeftIcon aria-hidden />
                            {t('steps.back')}
                        </Button>
                    ) : (
                        <span />
                    )}
                    {next ? (
                        <Button type="button" onClick={() => go(next)}>
                            {t('steps.next', { step: stepLabel(next) })}
                            <ArrowRightIcon aria-hidden />
                        </Button>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {props.share && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    aria-disabled={!props.ready || undefined}
                                    onClick={() =>
                                        props.ready && props.share?.()
                                    }
                                >
                                    <Share2Icon aria-hidden />
                                    {t('share')}
                                </Button>
                            )}
                            <Button
                                type="button"
                                aria-disabled={!props.ready || undefined}
                                onClick={() => props.ready && props.save()}
                            >
                                <DownloadIcon aria-hidden />
                                {t('save')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TemplateStep({
    template,
    setTemplate,
    thumbnails,
    aspect,
}: GraphicEditorProps) {
    const t = useTranslations('Graphics');
    return (
        <ThumbnailChoice
            name="template"
            legend={t('steps.template')}
            groups={[
                {
                    options: TEMPLATE_KEYS.map((key) => ({
                        value: key,
                        label: t(`templates.${key}.label`),
                        description: t(`templates.${key}.description`),
                        image: thumbnails.templates[key],
                    })),
                },
            ]}
            value={template}
            onChange={(value) => setTemplate(value as TemplateKey)}
            aspect={aspect}
        />
    );
}

function WordsStep({
    content,
    setField,
    linkInvalid,
    fillSlot,
}: GraphicEditorProps) {
    const t = useTranslations('Graphics');
    const id = useId();
    const [moreOpen, setMoreOpen] = useState(false);

    const textField = (
        field: Exclude<ContentField, 'date' | 'startTime' | 'endTime'>,
        options: {
            multiline?: boolean;
            hint?: string;
            error?: string;
            type?: string;
        } = {}
    ) => {
        const fieldId = `${id}-${field}`;
        const hintId = `${fieldId}-hint`;
        const shared = {
            id: fieldId,
            value: content[field],
            maxLength: CONTENT_LIMITS[field],
            'aria-invalid': options.error ? true : undefined,
            'aria-describedby':
                options.error || options.hint ? hintId : undefined,
        };
        return (
            <Field data-invalid={!!options.error}>
                <FieldLabel htmlFor={fieldId}>
                    {t(`fields.${field}`)}
                </FieldLabel>
                {options.multiline ? (
                    <Textarea
                        {...shared}
                        rows={4}
                        onChange={(e) => setField(field, e.target.value)}
                    />
                ) : (
                    <Input
                        {...shared}
                        type={options.type ?? 'text'}
                        inputMode={options.type === 'url' ? 'url' : undefined}
                        autoComplete="off"
                        onChange={(e) => setField(field, e.target.value)}
                    />
                )}
                {options.error ? (
                    <FieldError id={hintId}>{options.error}</FieldError>
                ) : options.hint ? (
                    <FieldDescription id={hintId}>
                        {options.hint}
                    </FieldDescription>
                ) : null}
            </Field>
        );
    };

    const timeField = (field: 'date' | 'startTime' | 'endTime') => (
        <Field>
            <FieldLabel htmlFor={`${id}-${field}`}>
                {t(`fields.${field}`)}
            </FieldLabel>
            <Input
                id={`${id}-${field}`}
                type={field === 'date' ? 'date' : 'time'}
                value={content[field]}
                onChange={(e) => setField(field, e.target.value)}
            />
        </Field>
    );

    return (
        <FieldGroup>
            <p className="text-sm text-muted-foreground">{t('detailsHint')}</p>
            {fillSlot}
            {textField('title')}
            {textField('tagline')}
            <div className="grid gap-4 sm:grid-cols-3">
                {timeField('date')}
                {timeField('startTime')}
                {timeField('endTime')}
            </div>
            {textField('place', { hint: t('fields.placeHint') })}
            {/* Opens by itself when something in it needs fixing. */}
            <details
                open={moreOpen || linkInvalid}
                onToggle={(e) => setMoreOpen(e.currentTarget.open)}
                className="rounded-lg border border-control"
            >
                <summary className="flex min-h-11 cursor-pointer items-center px-4 py-2 font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
                    {t('more')}
                </summary>
                <div className="flex flex-col gap-6 px-4 pb-4">
                    {textField('details', { multiline: true })}
                    {textField('host', { hint: t('fields.hostHint') })}
                    {textField('link', {
                        type: 'url',
                        hint: t('fields.linkHint'),
                        error: linkInvalid ? t('fields.linkError') : undefined,
                    })}
                </div>
            </details>
        </FieldGroup>
    );
}

function PicturesStep(props: GraphicEditorProps) {
    const t = useTranslations('Graphics');
    const shown = usesPhoto(LAYOUTS[props.layout]);
    return (
        <FieldGroup>
            <p className="text-sm text-muted-foreground">{t('picturesHint')}</p>
            <PictureField
                legend={t('photo.legend')}
                hint={t('photo.hint')}
                has={props.hasPhoto}
                onPick={props.pickPhoto}
                onRemove={props.removePhoto}
                labels={{
                    pick: t('photo.pick'),
                    change: t('photo.change'),
                    remove: t('photo.remove'),
                }}
            />
            {props.hasPhoto && !shown && (
                <div className="flex flex-col items-start gap-2 rounded-lg border border-control p-3 text-sm">
                    <p>{t('photo.notShown')}</p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={props.switchToPhotoLayout}
                    >
                        <ImageIcon aria-hidden />
                        {t('photo.useLayout')}
                    </Button>
                </div>
            )}
            {props.hasPhoto && shown && (
                <ChoiceGroup
                    kind="radio"
                    name="photo-focus"
                    legend={t('photo.focus')}
                    value={props.photoFocus}
                    onChange={(value) =>
                        props.setPhotoFocus(value as PhotoFocus)
                    }
                    columns
                    options={PHOTO_FOCUS.map((focus) => ({
                        value: focus,
                        label: t(`photo.focusOptions.${focus}`),
                    }))}
                />
            )}
            <PictureField
                legend={t('logo.legend')}
                hint={t('logo.hint')}
                has={props.hasLogo}
                onPick={props.pickLogo}
                onRemove={props.removeLogo}
                labels={{
                    pick: t('logo.pick'),
                    change: t('logo.change'),
                    remove: t('logo.remove'),
                }}
            />
            {props.error === 'picture' && (
                <p role="alert" className="text-sm text-destructive">
                    {t('photo.error')}
                </p>
            )}
        </FieldGroup>
    );
}

function LookStep(props: GraphicEditorProps) {
    const t = useTranslations('Graphics');
    const templateName = t(`templates.${props.template}.label`);
    const layoutOption = (key: LayoutKey) => ({
        value: key,
        label: t(`layout.options.${key}`),
        image: props.thumbnails.layouts[key],
    });
    const paletteOption = (key: PaletteKey) => ({
        value: key,
        label: t(`palette.options.${key}`),
        swatches: [
            PALETTES[key].background,
            PALETTES[key].accent,
            PALETTES[key].text,
        ],
    });
    const { suggested, rest } = props.layoutChoices;
    return (
        <FieldGroup>
            <p className="text-sm text-muted-foreground">{t('lookHint')}</p>
            <ChoiceGroup
                kind="radio"
                name="format"
                legend={t('format.legend')}
                value={props.format}
                onChange={(value) => props.setFormat(value as FormatKey)}
                columns
                options={FORMAT_KEYS.map((key) => ({
                    value: key,
                    label: t(`format.options.${key}.label`),
                    description: t(`format.options.${key}.description`),
                }))}
            />
            <ThumbnailChoice
                name="layout"
                legend={t('layout.legend')}
                groups={[
                    {
                        label: t('layout.groups.suggested', {
                            template: templateName,
                        }),
                        options: suggested.map(layoutOption),
                    },
                    ...(['type', 'photo'] as const)
                        .map((group) => ({
                            label: t(`layout.groups.${group}`),
                            options: rest
                                .filter((key) => LAYOUTS[key].group === group)
                                .map(layoutOption),
                        }))
                        .filter((group) => group.options.length),
                ]}
                value={props.layout}
                onChange={(value) => props.setLayout(value as LayoutKey)}
                aspect={props.aspect}
            />
            <ThumbnailChoice
                name="palette"
                legend={t('palette.legend')}
                hint={t('palette.hint')}
                groups={[
                    {
                        label: t('palette.groups.suggested', {
                            template: templateName,
                        }),
                        options:
                            props.paletteChoices.suggested.map(paletteOption),
                    },
                    {
                        label: t('palette.groups.more'),
                        options: props.paletteChoices.rest.map(paletteOption),
                    },
                ]}
                value={props.palette}
                onChange={(value) => props.setPalette(value as PaletteKey)}
                size="wide"
            />
            <ChoiceGroup
                kind="radio"
                name="graphic-language"
                legend={t('language.label')}
                hint={t('language.hint')}
                value={props.graphicLocale}
                onChange={(value) => props.setGraphicLocale(value as Locale)}
                columns
                options={routing.locales.map((locale) => ({
                    value: locale,
                    label: localeNames[locale],
                }))}
            />
        </FieldGroup>
    );
}

export interface FillFromOrganizationProps {
    /** Signed-in members: their organizations, to fill in from. */
    organizations?: { handle: string; name: string }[];
    fill?: (handle: string) => void;
    filling?: boolean;
    /** Signed out: where "Sign in" goes (back here afterwards). */
    signInHref?: string;
    /** The last fill failed. */
    error?: boolean;
}

/** Fills the host, link, place and logo from one of your organizations, or offers to sign in. */
export function FillFromOrganization({
    organizations,
    fill,
    filling,
    signInHref,
    error,
}: FillFromOrganizationProps) {
    const t = useTranslations('Graphics');
    const id = useId();
    const [handle, setHandle] = useState(organizations?.[0]?.handle ?? '');

    if (!organizations?.length || !fill) {
        if (!signInHref) return null;
        return (
            <p className="text-sm">
                <Link
                    href={signInHref}
                    className="underline underline-offset-4"
                >
                    {t('fill.signIn')}
                </Link>{' '}
                {t('fill.signInHint')}
            </p>
        );
    }
    return (
        <div className="flex flex-col gap-2 rounded-lg border p-4">
            <Field>
                <FieldLabel htmlFor={`${id}-org`}>{t('fill.label')}</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                        id={`${id}-org`}
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        aria-describedby={`${id}-org-hint`}
                        className="h-9 min-w-0 flex-1 rounded-md border border-control bg-transparent px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                    >
                        {organizations.map((org) => (
                            <option key={org.handle} value={org.handle}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        aria-disabled={filling || undefined}
                        onClick={() => !filling && fill(handle)}
                        {...track('graphic-fill')}
                    >
                        <WandSparklesIcon aria-hidden />
                        {t('fill.button')}
                    </Button>
                </div>
                <FieldDescription id={`${id}-org-hint`}>
                    {t('fill.hint')}
                </FieldDescription>
            </Field>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {t('fill.error')}
                </p>
            )}
        </div>
    );
}

function PictureField({
    legend,
    hint,
    has,
    onPick,
    onRemove,
    labels,
}: {
    legend: string;
    hint: string;
    has: boolean;
    onPick: (file: File) => void;
    onRemove: () => void;
    labels: { pick: string; change: string; remove: string };
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const pickRef = useRef<HTMLButtonElement>(null);
    const hintId = useId();
    return (
        <FieldSet>
            <FieldLegend variant="label">{legend}</FieldLegend>
            <FieldDescription id={hintId}>{hint}</FieldDescription>
            <div className="flex flex-wrap gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        // Let the same file be picked again later.
                        event.target.value = '';
                        if (file) onPick(file);
                    }}
                />
                <Button
                    ref={pickRef}
                    type="button"
                    variant="outline"
                    aria-describedby={hintId}
                    onClick={() => inputRef.current?.click()}
                >
                    <ImageIcon aria-hidden />
                    {has ? labels.change : labels.pick}
                </Button>
                {has && (
                    <Button
                        type="button"
                        variant="outline"
                        className="border-destructive text-destructive"
                        onClick={() => {
                            onRemove();
                            // The button goes away: keep focus on this field.
                            pickRef.current?.focus();
                        }}
                    >
                        <Trash2Icon aria-hidden />
                        {labels.remove}
                    </Button>
                )}
            </div>
        </FieldSet>
    );
}
