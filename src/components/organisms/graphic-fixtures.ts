// Shared by the graphics stories: the copy in every language, sample
// content, and a canvas ref that draws a real graphic (like the page does).

import '@fontsource/anton/400.css';
import '@fontsource/noto-sans/500.css';
import '@fontsource/noto-sans/800.css';
import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/800.css';

import type { Locale } from '@/i18n/routing';
import {
    EMPTY_CONTENT,
    graphicText,
    interpolate,
    layoutGraphic,
    LAYOUT_KEYS,
    PALETTES,
    TEMPLATE_KEYS,
    TEMPLATES,
    type FormatKey,
    type TemplateKey,
    type GraphicContent,
    type GraphicCopy,
    type LayoutKey,
    type PaletteKey,
} from '@/lib/graphics';
import { canvasMeasure, drawGraphic, loadFonts } from '@/lib/graphics/render';

import en from '../../../messages/en.json';
import es from '../../../messages/es.json';
import vi from '../../../messages/vi.json';
import zh from '../../../messages/zh.json';

export const GRAPHIC_COPIES: Record<Locale, GraphicCopy> = {
    en: en.Graphics.copy,
    es: es.Graphics.copy,
    vi: vi.Graphics.copy,
    zh: zh.Graphics.copy,
};

export const SAMPLE_CONTENT: GraphicContent = {
    ...EMPTY_CONTENT,
    title: 'Free Store',
    tagline: 'Take what you need. Leave what you can.',
    date: '2026-12-05',
    startTime: '10:00',
    endTime: '14:00',
    place: 'St. James Park, San José',
    details: 'Clothes, books, kitchen things and more. Everything is free.',
    host: 'South Bay Mutual Aid',
    link: 'communalists.com/organization/sbma',
};

export const SAMPLE_ALT =
    'Free store graphic. Take what you need. Leave what you can. Free Store. Saturday, December 5 · 10 AM – 2 PM. St. James Park, San José. Clothes, books, kitchen things and more. Everything is free. Hosted by South Bay Mutual Aid. QR code to communalists.com/organization/sbma.';

/** A canvas ref that draws `content` the way the page would (no photo or logo). */
export function drawSample({
    content = SAMPLE_CONTENT,
    format = 'square',
    layout = 'stripe',
    palette = 'rose',
}: {
    content?: GraphicContent;
    format?: FormatKey;
    layout?: LayoutKey;
    palette?: PaletteKey;
} = {}) {
    return (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        const text = graphicText(content, 'en', {
            hostedBy: (name) =>
                interpolate(en.Graphics.copy.hostedBy, { name }),
        });
        void loadFonts(Object.values(text).join(' ')).then(() => {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const result = layoutGraphic(
                {
                    format,
                    layout,
                    text,
                    photo: false,
                    photoFocus: 'center',
                    logo: false,
                    qr: 'https://communalists.com/organization/sbma',
                },
                canvasMeasure(ctx)
            );
            const scale = 1080 / Math.max(result.width, result.height);
            canvas.width = result.width * scale;
            canvas.height = result.height * scale;
            drawGraphic(ctx, result, { palette: PALETTES[palette], scale });
        });
    };
}

/** Draws one graphic small, as an image link (for picker stories). */
function renderThumbnail(
    format: FormatKey,
    layout: LayoutKey,
    palette: PaletteKey,
    content: GraphicContent,
    side = 280
): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    const text = graphicText(content, 'en', {
        hostedBy: (name) => interpolate(en.Graphics.copy.hostedBy, { name }),
    });
    const result = layoutGraphic(
        {
            format,
            layout,
            text,
            photo: false,
            photoFocus: 'center',
            logo: false,
            qr: 'https://communalists.com/organization/sbma',
        },
        canvasMeasure(ctx)
    );
    const scale = side / Math.max(result.width, result.height);
    canvas.width = Math.round(result.width * scale);
    canvas.height = Math.round(result.height * scale);
    drawGraphic(ctx, result, { palette: PALETTES[palette], scale });
    return canvas.toDataURL('image/jpeg', 0.85);
}

/** Thumbnails for every template and layout, like the editor makes (a story loader). */
export async function sampleThumbnails(format: FormatKey = 'square') {
    const copy = en.Graphics.copy;
    await loadFonts(
        Object.values(copy.templates)
            .flatMap((t) => [t.title, t.tagline, t.details])
            .join(' ')
    );
    const templates: Partial<Record<TemplateKey, string>> = {};
    for (const key of TEMPLATE_KEYS) {
        const { title, tagline, details } = copy.templates[key];
        templates[key] = renderThumbnail(
            format,
            TEMPLATES[key].layouts[0],
            TEMPLATES[key].palettes[0],
            { ...SAMPLE_CONTENT, title, tagline, details }
        );
    }
    const layouts: Partial<Record<LayoutKey, string>> = {};
    for (const key of LAYOUT_KEYS)
        layouts[key] = renderThumbnail(format, key, 'rose', SAMPLE_CONTENT);
    return { templates, layouts };
}

/** One graphic at full preview size, for the layout gallery. */
export async function sampleGraphic(
    format: FormatKey,
    layout: LayoutKey,
    palette: PaletteKey,
    content: GraphicContent = SAMPLE_CONTENT
) {
    await loadFonts(Object.values(content).join(' '));
    return renderThumbnail(format, layout, palette, content, 540);
}
