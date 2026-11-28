// The layout engine: turns a layout spec (./layouts/) into shapes for one
// size, words and set of pictures. Pure arithmetic; text is measured (by
// `measure`), wrapped and shrunk to fit, so nobody resizes anything by hand.
// render.ts draws the result, in order.

import { FORMATS, type FormatKey } from './formats';
import {
    isRule,
    type BlockSpec,
    type ByShape,
    type ColorRole,
    type DecorationSpec,
    type LayoutSpec,
    type RegionSpec,
    type Shape,
    type TextBlockSpec,
    type TextRole,
} from './layout-spec';
import { LAYOUTS, type LayoutKey } from './layouts';
import { CJK, fitText, type Fitted } from './text';
import type { PhotoFocus } from './templates';

export type { ColorRole, TextRole } from './layout-spec';

export type Font = 'display' | 'heavy' | 'body';

/** Width of `text` in `font` at `size` pixels. */
export type FontMeasure = (text: string, font: Font, size: number) => number;

export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type GraphicElement =
    | ({ kind: 'rect' | 'circle'; color: ColorRole } & Box)
    | ({ kind: 'photo'; focus: PhotoFocus } & Box)
    | ({ kind: 'logo' } & Box)
    | ({ kind: 'qr'; text: string } & Box)
    | {
          kind: 'text';
          role: TextRole;
          x: number;
          y: number;
          w: number;
          lines: string[];
          size: number;
          lineHeight: number;
          font: Font;
          color: ColorRole;
          /** What's behind it, for the contrast tests. */
          background: ColorRole | 'photo';
          align: 'left' | 'center' | 'right';
      };

export interface LayoutInput {
    format: FormatKey;
    layout: LayoutKey;
    /** Already in the graphic's language and ready to draw ("Hosted by…"). Empty strings are left out. */
    text: Record<TextRole, string>;
    photo: boolean;
    photoFocus: PhotoFocus;
    logo: boolean;
    /** The link the QR code opens, or null for none. */
    qr: string | null;
}

export interface GraphicLayout {
    width: number;
    height: number;
    transparent: boolean;
    elements: GraphicElement[];
    /** Text that didn't fit even at its smallest size, so its end was cut. */
    overflow: TextRole[];
}

interface TextStyle {
    font: Font;
    /** Sizes as a share of the graphic's width. */
    max: number;
    min: number;
    lineHeight: number;
    maxLines: number;
    /** Share of the free height it starts with. */
    weight: number;
    upper?: boolean;
}

const STYLES: Record<TextRole, TextStyle> = {
    tagline: {
        font: 'heavy',
        max: 0.05,
        min: 0.03,
        lineHeight: 1.2,
        maxLines: 3,
        weight: 2,
    },
    title: {
        font: 'display',
        max: 0.26,
        min: 0.07,
        lineHeight: 1.02,
        maxLines: 4,
        weight: 10,
        upper: true,
    },
    when: {
        font: 'heavy',
        max: 0.058,
        min: 0.032,
        lineHeight: 1.2,
        maxLines: 3,
        weight: 2.5,
    },
    place: {
        font: 'heavy',
        max: 0.046,
        min: 0.03,
        lineHeight: 1.2,
        maxLines: 3,
        weight: 2,
    },
    details: {
        font: 'body',
        max: 0.04,
        min: 0.026,
        lineHeight: 1.35,
        maxLines: 8,
        weight: 4,
    },
    host: {
        font: 'heavy',
        max: 0.038,
        min: 0.024,
        lineHeight: 1.2,
        maxLines: 2,
        weight: 0,
    },
    link: {
        font: 'body',
        max: 0.026,
        min: 0.018,
        lineHeight: 1.2,
        maxLines: 1,
        weight: 0,
    },
};

/** Anton has no Chinese, so Chinese headlines use heavy Noto Sans SC instead. */
const fontFor = (style: TextStyle, text: string): Font =>
    style.font === 'display' && CJK.test(text) ? 'heavy' : style.font;

export function shapeOf(width: number, height: number): Shape {
    const ratio = height / width;
    return ratio < 1.15 ? 'square' : ratio < 1.6 ? 'tall' : 'story';
}

const byShape = (value: ByShape, shape: Shape) =>
    typeof value === 'number' ? value : (value[shape] ?? value.default);

/** How far photos have shrunk to make room for words, step by step. */
const PHOTO_STEP = 0.03;

export function layoutGraphic(
    input: LayoutInput,
    measure: FontMeasure
): GraphicLayout {
    const spec = LAYOUTS[input.layout];
    const regions = regionsFor(spec, input.photo);
    if (!regions.some((r) => r.photo))
        return build(input, spec, regions, measure, 0);
    // Photos give up height, down to their limit, until the words fit.
    let shrink = 0;
    let result = build(input, spec, regions, measure, shrink);
    while (result.overflow.length && shrink < 1) {
        shrink += PHOTO_STEP;
        result = build(input, spec, regions, measure, shrink);
    }
    return result;
}

/** The regions to use: without a photo, a photo layout uses `withoutPhoto`. */
export function regionsFor(spec: LayoutSpec, photo: boolean): RegionSpec[] {
    if (photo || !spec.regions.some((r) => r.photo)) return spec.regions;
    return spec.withoutPhoto ?? spec.regions.filter((r) => !r.photo);
}

function build(
    input: LayoutInput,
    spec: LayoutSpec,
    regions: RegionSpec[],
    measure: FontMeasure,
    /** How much height (share of the page) each photo has given up. */
    shrink: number
): GraphicLayout {
    const format = FORMATS[input.format];
    const W = format.width;
    const H = format.height;
    const shape = shapeOf(W, H);
    const margin = format.bleed + W * (spec.margin ?? 0.075);
    const width = W - 2 * margin;
    const gap = W * 0.03;
    const pageColor = spec.background ?? 'background';
    const elements: GraphicElement[] = [];
    const overflow = new Set<TextRole>();

    const fit = (
        role: TextRole,
        w: number,
        h: number,
        scale = 1
    ): Fitted & { font: Font } => {
        const style = STYLES[role];
        const raw = input.text[role].trim();
        const text = style.upper ? raw.toLocaleUpperCase() : raw;
        const font = fontFor(style, text);
        const fitted = fitText({
            text,
            width: w,
            height: h,
            maxSize: W * style.max * scale,
            minSize: W * style.min * Math.min(1, scale),
            lineHeight: style.lineHeight,
            maxLines: style.maxLines,
            measure: (t, size) => measure(t, font, size),
        });
        if (fitted.overflow) overflow.add(role);
        return { ...fitted, font };
    };

    const textElement = (
        role: TextRole,
        fitted: Fitted & { font: Font },
        box: { x: number; y: number; w: number },
        color: ColorRole,
        background: ColorRole | 'photo',
        align: 'left' | 'center' | 'right' = 'left'
    ): GraphicElement => ({
        kind: 'text',
        role,
        ...box,
        lines: fitted.lines,
        size: fitted.size,
        lineHeight: STYLES[role].lineHeight,
        font: fitted.font,
        color,
        background,
        align,
    });

    if (!format.transparent)
        elements.push({
            kind: 'rect',
            x: 0,
            y: 0,
            w: W,
            h: H,
            color: pageColor,
        });

    // --- Footer: host and logo on the left, the QR code on the right.
    const qrSize = input.qr ? W * (format.use === 'print' ? 0.16 : 0.2) : 0;
    const logoSize = input.logo ? W * 0.12 : 0;
    const hasHost = !!input.text.host.trim();
    const labelHeight =
        input.qr && input.text.link.trim()
            ? W * STYLES.link.max * STYLES.link.lineHeight
            : 0;
    const qrBlock = input.qr
        ? qrSize + (labelHeight ? gap * 0.4 + labelHeight : 0)
        : 0;
    const hostWidth =
        width -
        (qrSize ? qrSize + gap : 0) -
        (logoSize ? logoSize + gap * 0.7 : 0);
    const host = hasHost
        ? fit('host', hostWidth, Math.max(logoSize, W * 0.1))
        : null;
    const footerHeight = Math.max(qrBlock, logoSize, host?.height ?? 0);
    const footerTop = H - margin - footerHeight;
    const footerBand =
        footerHeight && spec.footer?.fill ? footerTop - gap * 1.2 : null;
    // Where the regions end: the footer's band, or the bottom of the page.
    const areaBottom = footerBand ?? H;

    // --- Regions, top to bottom.
    const heights = regions.map((region) => {
        if (region.height === 'rest') return 0;
        const share = byShape(region.height, shape);
        const shrunk = region.photo
            ? Math.max(region.minHeight ?? share, share - shrink)
            : share;
        return shrunk * areaBottom;
    });
    const restIndex = regions.findIndex((r) => r.height === 'rest');
    if (restIndex >= 0)
        heights[restIndex] = Math.max(
            0,
            areaBottom - heights.reduce((s, h) => s + h, 0)
        );

    let lastBackground: ColorRole | 'photo' = pageColor;
    let regionTop = 0;
    regions.forEach((region, index) => {
        const height = heights[index];
        const regionBottom = regionTop + height;
        const isLast = index === regions.length - 1;
        if (region.fill)
            elements.push({
                kind: 'rect',
                x: 0,
                y: regionTop,
                w: W,
                h: height,
                color: region.fill,
            });
        if (region.photo) {
            elements.push({
                kind: 'photo',
                x: 0,
                y: regionTop,
                w: W,
                h: height,
                focus: input.photoFocus,
            });
        }
        const background: ColorRole | 'photo' = region.photo
            ? 'photo'
            : (region.fill ?? pageColor);
        if (isLast) lastBackground = background;
        const innerTop = regionTop + (regionTop === 0 ? margin : margin * 0.7);
        const innerBottom = isLast
            ? footerHeight && !footerBand
                ? footerTop - gap * 1.5
                : areaBottom - (footerBand ? margin * 0.7 : margin)
            : regionBottom - margin * 0.7;
        if (!region.photo) column(innerTop, innerBottom, region, background);
        regionTop = regionBottom;
    });

    // --- Footer elements (after the regions, so they draw on top of a band).
    const footerBackground: ColorRole | 'photo' =
        spec.footer?.fill ?? lastBackground;
    const footerColor = spec.footer?.color ?? 'text';
    if (footerBand !== null)
        elements.push({
            kind: 'rect',
            x: 0,
            y: footerBand,
            w: W,
            h: H - footerBand,
            color: spec.footer!.fill!,
        });
    if (footerHeight) {
        const center = input.qr
            ? footerTop + qrSize / 2
            : H - margin - Math.max(logoSize, host?.height ?? 0) / 2;
        if (input.qr) {
            elements.push({
                kind: 'qr',
                text: input.qr,
                x: W - margin - qrSize,
                y: footerTop,
                w: qrSize,
                h: qrSize,
            });
            if (labelHeight) {
                const labelWidth = width * 0.6;
                const label = fit('link', labelWidth, labelHeight);
                elements.push(
                    textElement(
                        'link',
                        label,
                        {
                            x: W - margin - labelWidth,
                            y: footerTop + qrSize + gap * 0.4,
                            w: labelWidth,
                        },
                        footerColor,
                        footerBackground,
                        'right'
                    )
                );
            }
        }
        if (logoSize)
            elements.push({
                kind: 'logo',
                x: margin,
                y: center - logoSize / 2,
                w: logoSize,
                h: logoSize,
            });
        if (host)
            elements.push(
                textElement(
                    'host',
                    host,
                    {
                        x: margin + (logoSize ? logoSize + gap * 0.7 : 0),
                        y: center - host.height / 2,
                        w: hostWidth,
                    },
                    footerColor,
                    footerBackground
                )
            );
    }

    for (const decoration of spec.decorations ?? [])
        elements.push(...decorate(decoration, W, H));

    /**
     * Fills a region's inside: `start` blocks stack down from the top, `end`
     * blocks up from the bottom (or `center` blocks in the middle). Each text
     * starts with a share of the height; text that wanted more gets what the
     * others didn't use. Crowded? Gaps close up before words are cut.
     */
    function column(
        top: number,
        bottom: number,
        region: RegionSpec,
        background: ColorRole | 'photo'
    ) {
        const ruleHeight = W * 0.012;
        // A rule only shows next to text (no lonely line when the info is empty).
        const present = (blocks: BlockSpec[] = []) => {
            const texts = blocks.filter(
                (b) => !isRule(b) && input.text[b.role].trim()
            );
            return texts.length
                ? blocks.filter((b) => isRule(b) || texts.includes(b))
                : [];
        };
        const centered = !!region.center;
        const first = present(centered ? region.center : region.start);
        const last = centered ? [] : present(region.end);
        const all = [...first, ...last];
        const texts = all.filter((b): b is TextBlockSpec => !isRule(b));
        const bandPad = W * 0.04;
        const bands = texts.reduce((s, t) => s + (t.band ? 2 * bandPad : 0), 0);
        const rules = all.filter(isRule).length * ruleHeight;
        const totalWeight =
            texts.reduce((s, t) => s + STYLES[t.role].weight, 0) || 1;

        const attempt = (space: number) => {
            for (const t of texts) overflow.delete(t.role);
            const free = Math.max(
                0,
                bottom -
                    top -
                    rules -
                    bands -
                    Math.max(0, all.length - 1) * space
            );
            const budgets = new Map(
                texts.map((t) => [
                    t.role,
                    (free * STYLES[t.role].weight) / totalWeight,
                ])
            );
            const fitAll = () =>
                new Map(
                    texts.map((t) => [
                        t.role,
                        fit(t.role, width, budgets.get(t.role)!, t.scale),
                    ])
                );
            let fitted = fitAll();
            const used = [...fitted.values()].reduce((s, f) => s + f.height, 0);
            const wanting = texts.filter((t) => {
                const f = fitted.get(t.role)!;
                return (
                    f.overflow ||
                    f.size < W * STYLES[t.role].max * (t.scale ?? 1) * 0.999
                );
            });
            const spare = free - used;
            if (wanting.length && spare > 1) {
                const wantWeight =
                    wanting.reduce((s, t) => s + STYLES[t.role].weight, 0) || 1;
                for (const t of texts)
                    budgets.set(t.role, fitted.get(t.role)!.height);
                for (const t of wanting)
                    budgets.set(
                        t.role,
                        budgets.get(t.role)! +
                            (spare * STYLES[t.role].weight) / wantWeight
                    );
                for (const t of texts) overflow.delete(t.role);
                fitted = fitAll();
            }
            return fitted;
        };
        let space = gap;
        let fitted = attempt(space);
        if (texts.some((t) => overflow.has(t.role))) {
            space = gap * 0.4;
            fitted = attempt(space);
        }

        const heightOf = (block: BlockSpec) =>
            isRule(block)
                ? ruleHeight
                : fitted.get(block.role)!.height +
                  (block.band ? 2 * bandPad : 0);
        const stackHeight = (blocks: BlockSpec[]) =>
            blocks.reduce((s, b) => s + heightOf(b), 0) +
            Math.max(0, blocks.length - 1) * space;
        const place = (block: BlockSpec, y: number) => {
            if (isRule(block)) {
                const w = width * (block.width ?? 0.22);
                const x =
                    block.align === 'center'
                        ? margin + (width - w) / 2
                        : margin;
                elements.push({
                    kind: 'rect',
                    x,
                    y,
                    w,
                    h: ruleHeight,
                    color: block.rule,
                });
                return;
            }
            const f = fitted.get(block.role)!;
            const align = block.align ?? 'left';
            if (block.band) {
                elements.push({
                    kind: 'rect',
                    x: 0,
                    y,
                    w: W,
                    h: heightOf(block),
                    color: block.band,
                });
                elements.push(
                    textElement(
                        block.role,
                        f,
                        { x: margin, y: y + bandPad, w: width },
                        block.color,
                        block.band,
                        align
                    )
                );
            } else {
                elements.push(
                    textElement(
                        block.role,
                        f,
                        { x: margin, y, w: width },
                        block.color,
                        background,
                        align
                    )
                );
            }
        };

        let y = centered
            ? top + Math.max(0, (bottom - top - stackHeight(first)) / 2)
            : top;
        for (const block of first) {
            place(block, y);
            y += heightOf(block) + space;
        }
        let endY = Math.max(y, bottom - stackHeight(last));
        for (const block of last) {
            place(block, endY);
            endY += heightOf(block) + space;
        }
    }

    // Draw order: background, regions and bands, photos, decorations, then words and the footer's pictures.
    const order = (e: GraphicElement) =>
        e.kind === 'rect' || e.kind === 'circle'
            ? 0
            : e.kind === 'photo'
              ? 1
              : e.kind === 'text'
                ? 3
                : 4;
    elements.sort((a, b) => order(a) - order(b));

    return {
        width: W,
        height: H,
        transparent: format.transparent,
        elements,
        overflow: [...overflow],
    };
}

function decorate(
    decoration: DecorationSpec,
    W: number,
    H: number
): GraphicElement[] {
    if (decoration.kind === 'frame') {
        const inset = W * decoration.inset;
        const t = W * decoration.thickness;
        const color = decoration.color;
        return [
            { kind: 'rect', x: inset, y: inset, w: W - 2 * inset, h: t, color },
            {
                kind: 'rect',
                x: inset,
                y: H - inset - t,
                w: W - 2 * inset,
                h: t,
                color,
            },
            { kind: 'rect', x: inset, y: inset, w: t, h: H - 2 * inset, color },
            {
                kind: 'rect',
                x: W - inset - t,
                y: inset,
                w: t,
                h: H - 2 * inset,
                color,
            },
        ];
    }
    return [
        {
            kind: decoration.kind,
            x: decoration.x * W,
            y: decoration.y * H,
            w: decoration.w * W,
            h: decoration.h * H,
            color: decoration.color,
        },
    ];
}
