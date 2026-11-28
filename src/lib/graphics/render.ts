// Drawing a laid-out graphic onto a canvas. Browser only (it needs a canvas
// and loaded fonts), but no React, so the editor, Storybook and a future app
// share it. Fonts are bundled (@fontsource), never fetched from Google
// (decision #72), and must be loaded before drawing: see loadFonts.

import type {
    Font,
    FontMeasure,
    GraphicElement,
    GraphicLayout,
} from './layout';
import type { Palette } from './palettes';
import { QR_QUIET_ZONE, qrModules } from './qr';

const FAMILIES: Record<Font, string> = {
    display: '"Anton", "Noto Sans", "Noto Sans SC", sans-serif',
    heavy: '"Noto Sans", "Noto Sans SC", sans-serif',
    body: '"Noto Sans", "Noto Sans SC", sans-serif',
};
const WEIGHTS: Record<Font, number> = { display: 400, heavy: 800, body: 500 };

/** The canvas `font` value for `font` at `size` pixels. */
export const fontCss = (font: Font, size: number) =>
    `${WEIGHTS[font]} ${size}px ${FAMILIES[font]}`;

/** Measures text with a canvas context (any size works; the canvas isn't drawn on). */
export function canvasMeasure(ctx: CanvasRenderingContext2D): FontMeasure {
    return (text, font, size) => {
        ctx.font = fontCss(font, size);
        return ctx.measureText(text).width;
    };
}

/**
 * Loads the font files needed to draw `text` in every font (each language's
 * file loads only when its characters appear). Measuring before this would
 * measure a fallback font.
 */
export async function loadFonts(text: string): Promise<void> {
    if (typeof document === 'undefined' || !document.fonts) return;
    const sample = text || 'A';
    await Promise.all(
        (Object.keys(FAMILIES) as Font[]).map((font) =>
            document.fonts.load(fontCss(font, 40), sample).catch(() => [])
        )
    );
}

/** A picture ready to draw: a decoded bitmap or a loaded <img>. */
export type Picture = ImageBitmap | HTMLImageElement | HTMLCanvasElement;

const sizeOf = (picture: Picture) =>
    'naturalWidth' in picture
        ? { w: picture.naturalWidth, h: picture.naturalHeight }
        : { w: picture.width, h: picture.height };

function drawCover(
    ctx: CanvasRenderingContext2D,
    picture: Picture,
    box: { x: number; y: number; w: number; h: number },
    focus: 'top' | 'center' | 'bottom'
) {
    const { w, h } = sizeOf(picture);
    if (!w || !h) return;
    const scale = Math.max(box.w / w, box.h / h);
    const sw = box.w / scale;
    const sh = box.h / scale;
    const sx = (w - sw) / 2;
    const share = focus === 'top' ? 0 : focus === 'bottom' ? 1 : 0.5;
    const sy = (h - sh) * share;
    ctx.drawImage(picture, sx, sy, sw, sh, box.x, box.y, box.w, box.h);
}

function drawContain(
    ctx: CanvasRenderingContext2D,
    picture: Picture,
    box: { x: number; y: number; w: number; h: number }
) {
    const { w, h } = sizeOf(picture);
    if (!w || !h) return;
    const scale = Math.min(box.w / w, box.h / h);
    const dw = w * scale;
    const dh = h * scale;
    ctx.drawImage(
        picture,
        box.x + (box.w - dw) / 2,
        box.y + (box.h - dh) / 2,
        dw,
        dh
    );
}

function drawQr(
    ctx: CanvasRenderingContext2D,
    text: string,
    box: { x: number; y: number; w: number }
) {
    const modules = qrModules(text);
    const count = modules.length + QR_QUIET_ZONE * 2;
    const cell = box.w / count;
    // Always black on white, with its quiet zone: scanners need the contrast.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(box.x, box.y, box.w, box.w);
    ctx.fillStyle = '#000000';
    modules.forEach((row, r) =>
        row.forEach((dark, c) => {
            if (!dark) return;
            // A hair of overlap so no seams show between squares.
            ctx.fillRect(
                box.x + (c + QR_QUIET_ZONE) * cell,
                box.y + (r + QR_QUIET_ZONE) * cell,
                cell + 0.5,
                cell + 0.5
            );
        })
    );
}

export interface DrawOptions {
    palette: Palette;
    photo?: Picture | null;
    logo?: Picture | null;
    /** 1 for the saved file; less for a smaller preview. */
    scale?: number;
}

/** Draws `layout` onto `ctx`. The canvas should be `layout.width × scale` wide. */
export function drawGraphic(
    ctx: CanvasRenderingContext2D,
    layout: GraphicLayout,
    { palette, photo, logo, scale = 1 }: DrawOptions
) {
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, layout.width, layout.height);
    for (const element of layout.elements)
        drawElement(ctx, element, palette, photo, logo);
    ctx.restore();
}

function drawElement(
    ctx: CanvasRenderingContext2D,
    element: GraphicElement,
    palette: Palette,
    photo?: Picture | null,
    logo?: Picture | null
) {
    switch (element.kind) {
        case 'rect':
            ctx.fillStyle = palette[element.color];
            ctx.fillRect(element.x, element.y, element.w, element.h);
            return;
        case 'circle':
            ctx.fillStyle = palette[element.color];
            ctx.beginPath();
            ctx.ellipse(
                element.x + element.w / 2,
                element.y + element.h / 2,
                element.w / 2,
                element.h / 2,
                0,
                0,
                Math.PI * 2
            );
            ctx.fill();
            return;
        case 'photo':
            if (photo) drawCover(ctx, photo, element, element.focus);
            return;
        case 'logo':
            if (logo) drawContain(ctx, logo, element);
            return;
        case 'qr':
            drawQr(ctx, element.text, element);
            return;
        case 'text': {
            ctx.fillStyle = palette[element.color];
            ctx.font = fontCss(element.font, element.size);
            ctx.textBaseline = 'middle';
            ctx.textAlign = element.align;
            const x =
                element.align === 'right'
                    ? element.x + element.w
                    : element.align === 'center'
                      ? element.x + element.w / 2
                      : element.x;
            const step = element.size * element.lineHeight;
            element.lines.forEach((line, i) =>
                ctx.fillText(line, x, element.y + step * (i + 0.5))
            );
        }
    }
}
