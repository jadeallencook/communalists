'use client';

// The graphics editor's state and drawing (decision #75): what people
// picked and typed, the live preview, the saved PNG, sharing, and the alt
// text. Everything happens in the browser; pictures are never uploaded.
// The fonts are bundled (@fontsource) and loaded only on this page.

import '@fontsource/anton/400.css';
import '@fontsource/noto-sans/500.css';
import '@fontsource/noto-sans/800.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/800.css';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { GraphicOrganizationResult } from '@/app/actions/graphics';
import type { Locale } from '@/i18n/routing';
import { trackEvent } from '@/lib/analytics/browser';
import {
    altText,
    EMPTY_CONTENT,
    fileName,
    FORMATS,
    graphicText,
    interpolate,
    layoutGraphic,
    linkLabel,
    normalizeLink,
    LAYOUT_KEYS,
    LAYOUTS,
    PALETTE_KEYS,
    PALETTES,
    suggestedFirst,
    TEMPLATE_KEYS,
    TEMPLATE_TEXT_FIELDS,
    TEMPLATES,
    usesPhoto,
    type ContentField,
    type FormatKey,
    type GraphicStep,
    type GraphicContent,
    type GraphicCopy,
    type LayoutKey,
    type PaletteKey,
    type PhotoFocus,
    type TemplateKey,
    type TemplateTextField,
    type TextRole,
} from '@/lib/graphics';
import {
    canvasMeasure,
    drawGraphic,
    loadFonts,
    type Picture,
} from '@/lib/graphics/render';
import { MAX_SOURCE_BYTES } from '@/lib/photos';

/** Longest side the preview is drawn at (the saved file is full size). */
const PREVIEW_SIDE = 1350;
/** Longest side of the pictures in the template and layout pickers. */
const THUMBNAIL_SIDE = 280;

/** Draws one graphic small and returns it as an image link. */
function thumbnail(
    input: Parameters<typeof layoutGraphic>[0],
    palette: PaletteKey,
    photo: Picture | null,
    logo: Picture | null
): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const result = layoutGraphic(input, canvasMeasure(ctx));
    const scale = THUMBNAIL_SIDE / Math.max(result.width, result.height);
    canvas.width = Math.round(result.width * scale);
    canvas.height = Math.round(result.height * scale);
    drawGraphic(ctx, result, {
        palette: PALETTES[palette],
        photo,
        logo,
        scale,
    });
    return canvas.toDataURL('image/jpeg', 0.85);
}

export type GraphicNotice =
    | { kind: 'photo-added' | 'photo-removed' | 'logo-added' | 'logo-removed' }
    | { kind: 'filled'; name: string }
    | { kind: 'saved'; file: string }
    | { kind: 'shared' };

export type GraphicError = 'picture' | 'fill' | 'save';

export interface UseGraphicEditorOptions {
    /** The graphic's words in each language, from `Graphics.copy`. */
    copies: Record<Locale, GraphicCopy>;
    /** The visitor's UI language: the graphic starts in it. */
    locale: Locale;
    /** Signed-in members: loads one of their organizations' details. */
    fillAction?: (handle: string) => Promise<GraphicOrganizationResult>;
}

const templateText = (
    copy: GraphicCopy,
    template: TemplateKey
): Pick<GraphicContent, TemplateTextField> => {
    const { title, tagline, details } = copy.templates[template];
    return { title, tagline, details };
};

async function decode(blob: Blob): Promise<Picture> {
    if (typeof createImageBitmap === 'function') return createImageBitmap(blob);
    const url = URL.createObjectURL(blob);
    try {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img;
    } finally {
        URL.revokeObjectURL(url);
    }
}

const release = (picture: Picture | null) => {
    if (picture && 'close' in picture) picture.close();
};

export function useGraphicEditor({
    copies,
    locale,
    fillAction,
}: UseGraphicEditorOptions) {
    const [template, setTemplateKey] = useState<TemplateKey>('free-store');
    const [format, setFormat] = useState<FormatKey>('square');
    const [layout, setLayoutKey] = useState<LayoutKey>(
        TEMPLATES['free-store'].layouts[0]
    );
    const [palette, setPaletteKey] = useState<PaletteKey>(
        TEMPLATES['free-store'].palettes[0]
    );
    const [graphicLocale, setGraphicLocaleKey] = useState<Locale>(locale);
    const [content, setContent] = useState<GraphicContent>(() => ({
        ...EMPTY_CONTENT,
        ...templateText(copies[locale], 'free-store'),
    }));
    // Fields the person changed: switching template or language leaves them alone.
    const [touched, setTouched] = useState<ReadonlySet<ContentField>>(
        () => new Set()
    );
    // Once they choose a layout or colours, a new template doesn't change them.
    const [styled, setStyled] = useState(false);
    const [photo, setPhoto] = useState<Picture | null>(null);
    const [photoFocus, setPhotoFocus] = useState<PhotoFocus>('center');
    const [logo, setLogo] = useState<Picture | null>(null);
    const [notice, setNotice] = useState<GraphicNotice | null>(null);
    const [error, setError] = useState<GraphicError | null>(null);
    const [overflow, setOverflow] = useState<TextRole[]>([]);
    const [filling, setFilling] = useState(false);
    const [step, setStep] = useState<GraphicStep>('template');

    const copy = copies[graphicLocale];
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const say = (next: GraphicNotice) => {
        setError(null);
        setNotice(next);
    };

    // --- Choosing

    const resetUntouched = (nextTemplate: TemplateKey, nextLocale: Locale) => {
        const words = templateText(copies[nextLocale], nextTemplate);
        setContent((current) => {
            const next = { ...current };
            for (const field of TEMPLATE_TEXT_FIELDS)
                if (!touched.has(field)) next[field] = words[field];
            return next;
        });
    };

    const setTemplate = (next: TemplateKey) => {
        setTemplateKey(next);
        resetUntouched(next, graphicLocale);
        if (!styled) {
            setLayoutKey(TEMPLATES[next].layouts[0]);
            setPaletteKey(TEMPLATES[next].palettes[0]);
        }
        trackEvent('graphic-template', { template: next });
    };

    const setGraphicLocale = (next: Locale) => {
        setGraphicLocaleKey(next);
        resetUntouched(template, next);
    };

    const setLayout = (next: LayoutKey) => {
        setLayoutKey(next);
        setStyled(true);
    };

    const setPalette = (next: PaletteKey) => {
        setPaletteKey(next);
        setStyled(true);
    };

    /** Switches to a layout that shows the photo (the template's suggestion, if it has one). */
    const switchToPhotoLayout = () => {
        const next =
            TEMPLATES[template].layouts.find((key) =>
                usesPhoto(LAYOUTS[key])
            ) ?? LAYOUT_KEYS.find((key) => usesPhoto(LAYOUTS[key]));
        if (next) setLayout(next);
    };

    const setField = (field: ContentField, value: string) => {
        setContent((current) => ({ ...current, [field]: value }));
        setTouched((current) => new Set(current).add(field));
    };

    // --- Pictures (they stay in memory, never uploaded or stored)

    const readPicture = async (picked: File): Promise<Picture | null> => {
        if (
            !picked.type.startsWith('image/') ||
            picked.size > MAX_SOURCE_BYTES
        ) {
            setError('picture');
            return null;
        }
        try {
            return await decode(picked);
        } catch {
            setError('picture');
            return null;
        }
    };

    const pickPhoto = async (picked: File) => {
        const picture = await readPicture(picked);
        if (!picture) return;
        setPhoto((old) => {
            release(old);
            return picture;
        });
        say({ kind: 'photo-added' });
    };

    const removePhoto = () => {
        setPhoto((old) => {
            release(old);
            return null;
        });
        say({ kind: 'photo-removed' });
    };

    const pickLogo = async (picked: File) => {
        const picture = await readPicture(picked);
        if (!picture) return;
        setLogo((old) => {
            release(old);
            return picture;
        });
        say({ kind: 'logo-added' });
    };

    const removeLogo = () => {
        setLogo((old) => {
            release(old);
            return null;
        });
        say({ kind: 'logo-removed' });
    };

    // --- Filling in from an organization

    const fill = async (handle: string) => {
        if (!fillAction || filling) return;
        setFilling(true);
        try {
            const result = await fillAction(handle);
            if (!result.ok) {
                setError('fill');
                return;
            }
            const { name, link, place, logo: logoUrl } = result.organization;
            setContent((current) => ({
                ...current,
                host: name,
                link,
                // An address someone already typed wins.
                place: current.place.trim() ? current.place : (place ?? ''),
            }));
            setTouched((current) => new Set(current).add('host').add('link'));
            if (logoUrl) {
                const picture = await decode(
                    await (await fetch(logoUrl)).blob()
                ).catch(() => null);
                if (picture)
                    setLogo((old) => {
                        release(old);
                        return picture;
                    });
            }
            say({ kind: 'filled', name });
        } catch {
            setError('fill');
        } finally {
            setFilling(false);
        }
    };

    // --- Drawing

    const link = normalizeLink(content.link);
    const linkInvalid = !!content.link.trim() && !link;
    const text = useMemo(
        () =>
            graphicText(content, graphicLocale, {
                hostedBy: (name) => interpolate(copy.hostedBy, { name }),
            }),
        [content, graphicLocale, copy]
    );
    const alt = useMemo(
        () =>
            altText(
                interpolate(copy.alt, {
                    template: copy.templates[template].name,
                }),
                text,
                link ? interpolate(copy.qr, { link: linkLabel(link) }) : ''
            ),
        [copy, template, text, link]
    );
    const size = FORMATS[format];
    const previewScale = Math.min(
        1,
        PREVIEW_SIDE / Math.max(size.width, size.height)
    );

    // Everything a drawing depends on; a new object whenever any of it changes.
    const request = useMemo(
        () => ({
            text,
            format,
            layout,
            palette,
            photo,
            photoFocus,
            logo,
            link,
            template,
            previewScale,
        }),
        [
            text,
            format,
            layout,
            palette,
            photo,
            photoFocus,
            logo,
            link,
            template,
            previewScale,
        ]
    );
    // The saved file for one request: stale as soon as anything changes.
    const [made, setMade] = useState<{
        request: typeof request;
        file: File;
        canShare: boolean;
    } | null>(null);
    const file = made?.request === request ? made.file : null;

    useEffect(() => {
        let stale = false;
        const draw = async () => {
            await loadFonts(Object.values(request.text).join(' '));
            if (stale) return;
            const measuring = document.createElement('canvas').getContext('2d');
            const canvas = canvasRef.current;
            if (!measuring || !canvas) return;
            const result = layoutGraphic(
                {
                    format: request.format,
                    layout: request.layout,
                    text: request.text,
                    photo: !!request.photo,
                    photoFocus: request.photoFocus,
                    logo: !!request.logo,
                    qr: request.link,
                },
                canvasMeasure(measuring)
            );
            setOverflow(result.overflow);
            const options = {
                palette: PALETTES[request.palette],
                photo: request.photo,
                logo: request.logo,
            };
            canvas.width = Math.round(result.width * request.previewScale);
            canvas.height = Math.round(result.height * request.previewScale);
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            drawGraphic(ctx, result, {
                ...options,
                scale: request.previewScale,
            });

            // The full-size file, made ahead of time so Share can open at once
            // (browsers only allow it right after a press). Waits for typing
            // to pause first.
            await new Promise((resolve) => setTimeout(resolve, 300));
            if (stale) return;
            const full = document.createElement('canvas');
            full.width = result.width;
            full.height = result.height;
            const fullCtx = full.getContext('2d');
            if (!fullCtx) return;
            drawGraphic(fullCtx, result, options);
            const blob = await new Promise<Blob | null>((resolve) =>
                full.toBlob(resolve, 'image/png')
            );
            if (stale || !blob) return;
            const saved = new File(
                [blob],
                fileName(request.template, request.format),
                {
                    type: 'image/png',
                }
            );
            setMade({
                request,
                file: saved,
                canShare:
                    typeof navigator !== 'undefined' &&
                    !!navigator.canShare?.({ files: [saved] }),
            });
        };
        draw().catch(() => {
            if (!stale) setError('save');
        });
        return () => {
            stale = true;
        };
    }, [request]);

    // --- Pictures for the pickers: each template, and each layout, drawn
    // small with the person's own words. Only on the steps that show them,
    // and after typing pauses.
    const [thumbnails, setThumbnails] = useState<{
        templates: Partial<Record<TemplateKey, string>>;
        layouts: Partial<Record<LayoutKey, string>>;
    }>({ templates: {}, layouts: {} });
    useEffect(() => {
        if (step !== 'template' && step !== 'look') return;
        let stale = false;
        const timer = setTimeout(async () => {
            const hostedBy = (name: string) =>
                interpolate(copy.hostedBy, { name });
            const shared = {
                format: request.format,
                photo: !!request.photo,
                photoFocus: request.photoFocus,
                logo: !!request.logo,
                qr: request.link,
            };
            const words = TEMPLATE_KEYS.map((key) =>
                graphicText(
                    { ...content, ...templateText(copy, key) },
                    graphicLocale,
                    { hostedBy }
                )
            );
            await loadFonts(
                [...words, request.text]
                    .flatMap((t) => Object.values(t))
                    .join(' ')
            );
            if (stale) return;
            if (step === 'template') {
                const templates: Partial<Record<TemplateKey, string>> = {};
                TEMPLATE_KEYS.forEach((key, i) => {
                    templates[key] = thumbnail(
                        {
                            ...shared,
                            layout: TEMPLATES[key].layouts[0],
                            text: words[i],
                        },
                        TEMPLATES[key].palettes[0],
                        request.photo,
                        request.logo
                    );
                });
                setThumbnails((current) => ({ ...current, templates }));
            } else {
                const layouts: Partial<Record<LayoutKey, string>> = {};
                for (const key of LAYOUT_KEYS)
                    layouts[key] = thumbnail(
                        { ...shared, layout: key, text: request.text },
                        request.palette,
                        request.photo,
                        request.logo
                    );
                setThumbnails((current) => ({ ...current, layouts }));
            }
        }, 250);
        return () => {
            stale = true;
            clearTimeout(timer);
        };
    }, [step, request, content, copy, graphicLocale]);

    const layoutChoices = suggestedFirst(
        TEMPLATES[template].layouts,
        LAYOUT_KEYS
    );
    const paletteChoices = suggestedFirst(
        TEMPLATES[template].palettes,
        PALETTE_KEYS
    );

    const report = (via: 'download' | 'share') =>
        trackEvent('graphic-save', { template, format, layout, via });

    const save = () => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        report('download');
        say({ kind: 'saved', file: file.name });
    };

    const share = async () => {
        if (!file) return;
        try {
            await navigator.share({ files: [file], title: content.title });
            report('share');
            say({ kind: 'shared' });
        } catch (e) {
            // Closing the share sheet isn't an error.
            if ((e as Error).name !== 'AbortError') setError('save');
        }
    };

    return {
        step,
        setStep,
        thumbnails,
        layoutChoices,
        paletteChoices,
        switchToPhotoLayout,
        template,
        setTemplate,
        format,
        setFormat,
        layout,
        setLayout,
        palette,
        setPalette,
        graphicLocale,
        setGraphicLocale,
        content,
        setField,
        linkInvalid,
        hasPhoto: !!photo,
        pickPhoto,
        removePhoto,
        photoFocus,
        setPhotoFocus,
        hasLogo: !!logo,
        pickLogo,
        removeLogo,
        fill: fillAction ? fill : undefined,
        filling,
        canvasRef,
        aspect: size.width / size.height,
        ready: !!file,
        overflow,
        alt,
        save,
        share: made?.canShare ? share : undefined,
        notice,
        error,
    };
}

export type GraphicEditor = ReturnType<typeof useGraphicEditor>;
