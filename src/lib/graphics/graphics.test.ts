import { describe, expect, it } from 'vitest';

import {
    altText,
    contrast,
    FORMAT_KEYS,
    FORMATS,
    fitText,
    formatDate,
    formatTimes,
    formatWhen,
    graphicText,
    interpolate,
    isLayoutKey,
    LAYOUTS,
    usesPhoto,
    LAYOUT_KEYS,
    layoutGraphic,
    linkLabel,
    normalizeLink,
    PALETTE_KEYS,
    PALETTES,
    TEMPLATE_KEYS,
    TEMPLATES,
    tokenize,
    wrap,
    type FontMeasure,
    type GraphicElement,
    type TextRole,
} from '.';
import { qrModules } from './qr';

// Every character half as wide as it is tall: close enough to real fonts.
const fake = (text: string, size: number) => [...text].length * size * 0.5;
const fontFake: FontMeasure = (text, _font, size) => fake(text, size);

describe('wrap', () => {
    it('breaks between words', () => {
        expect(wrap('free store today', 49, (t) => fake(t, 10)).lines).toEqual([
            'free',
            'store',
            'today',
        ]);
        expect(wrap('free store today', 60, (t) => fake(t, 10)).lines).toEqual([
            'free store',
            'today',
        ]);
    });

    it('splits a word only when it is wider than the line', () => {
        const result = wrap('neighborhood', 40, (t) => fake(t, 10));
        expect(result.broke).toBe(true);
        expect(result.lines).toEqual(['neighbor', 'hood']);
    });

    it('breaks Chinese between characters', () => {
        expect(tokenize('免费商店 Free')).toEqual([
            '免',
            '费',
            '商',
            '店',
            ' ',
            'Free',
        ]);
        const result = wrap('免费商店', 10, (t) => fake(t, 10));
        expect(result).toEqual({ lines: ['免费', '商店'], broke: false });
    });

    it('keeps typed line breaks and one blank line between paragraphs', () => {
        expect(
            wrap('Bring water\nBring a friend\n\n\nWear shoes', 500, (t) =>
                fake(t, 10)
            ).lines
        ).toEqual(['Bring water', 'Bring a friend', '', 'Wear shoes']);
    });
});

describe('fitText', () => {
    const base = {
        width: 100,
        height: 100,
        maxSize: 40,
        minSize: 10,
        lineHeight: 1,
        maxLines: 10,
        measure: fake,
    };

    it('uses the largest size that fits', () => {
        const result = fitText({ ...base, text: 'hi' });
        expect(result.size).toBe(40);
        expect(result.lines).toEqual(['hi']);
        expect(result.overflow).toBe(false);
    });

    it('shrinks long text until it fits the box', () => {
        const result = fitText({ ...base, text: 'free store open saturday' });
        expect(result.overflow).toBe(false);
        expect(result.height).toBeLessThanOrEqual(100);
        expect(result.size).toBeLessThan(40);
        for (const line of result.lines)
            expect(fake(line, result.size)).toBeLessThanOrEqual(100);
    });

    it('prefers a smaller size over splitting a word', () => {
        const result = fitText({ ...base, text: 'neighbors' });
        expect(result.lines).toEqual(['neighbors']);
    });

    it('cuts the end with … when it cannot fit at the smallest size', () => {
        const result = fitText({ ...base, text: 'word '.repeat(200) });
        expect(result.overflow).toBe(true);
        expect(result.size).toBe(10);
        expect(result.lines.at(-1)).toMatch(/…$/);
        expect(result.height).toBeLessThanOrEqual(100);
    });

    it('respects the line limit', () => {
        const result = fitText({
            ...base,
            maxLines: 2,
            text: 'a b c d e f g h i j k l m n o p',
        });
        expect(result.lines.length).toBeLessThanOrEqual(2);
    });

    it('takes no room when empty', () => {
        expect(fitText({ ...base, text: '  ' })).toMatchObject({
            lines: [],
            height: 0,
            overflow: false,
        });
    });
});

describe('when', () => {
    it('writes the date in the graphic language, without shifting the day', () => {
        expect(formatDate('2026-12-05', 'en')).toBe('Saturday, December 5');
        expect(formatDate('2026-12-05', 'es')).toBe('sábado, 5 de diciembre');
        expect(formatDate('2026-12-05', 'zh')).toContain('12月5日');
        expect(formatDate('2026-12-05', 'vi')).toContain('5');
    });

    it('ignores dates that are not real', () => {
        expect(formatDate('2026-02-30', 'en')).toBe('');
        expect(formatDate('', 'en')).toBe('');
        expect(formatDate('12/05/2026', 'en')).toBe('');
    });

    it('shows minutes only when a time has them', () => {
        expect(formatTimes('10:00', '14:00', 'en')).toMatch(
            /^10\sAM\s–\s2\sPM$/
        );
        expect(formatTimes('18:30', '20:00', 'en')).toMatch(
            /^6:30\s–\s8:00\sPM$/
        );
        expect(formatTimes('10:00', '', 'en')).toMatch(/^10\sAM$/);
        expect(formatTimes('', '14:00', 'en')).toBe('');
        expect(formatTimes('25:00', '', 'en')).toBe('');
    });

    it('uses a 24-hour clock where the language does', () => {
        expect(formatTimes('18:00', '', 'vi')).toContain('18');
    });

    it('joins the date and times on one line', () => {
        expect(formatWhen('2026-12-05', '10:00', '14:00', 'en')).toMatch(
            /^Saturday, December 5 · 10\sAM\s–\s2\sPM$/
        );
        expect(formatWhen('', '10:00', '', 'en')).toMatch(/^10\sAM$/);
        expect(formatWhen('', '', '', 'en')).toBe('');
    });
});

describe('links', () => {
    it('adds https:// when it is missing', () => {
        expect(normalizeLink('communalists.com/organization/sbma')).toBe(
            'https://communalists.com/organization/sbma'
        );
        expect(normalizeLink(' https://example.org ')).toBe(
            'https://example.org/'
        );
    });

    it('refuses things that are not web links', () => {
        expect(normalizeLink('')).toBeNull();
        expect(normalizeLink('not a link')).toBeNull();
        expect(normalizeLink('javascript:alert(1)')).toBeNull();
        expect(normalizeLink('mailto:hi@example.org')).toBeNull();
        expect(normalizeLink('nodot')).toBeNull();
    });

    it('prints a short label for people who cannot scan', () => {
        expect(linkLabel('https://www.example.org/')).toBe('example.org');
        expect(linkLabel('https://communalists.com/organization/sbma/')).toBe(
            'communalists.com/organization/sbma'
        );
    });
});

describe('palettes', () => {
    it.each(Object.entries(PALETTES))('%s is readable (WCAG AA)', (_, p) => {
        expect(contrast(p.text, p.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.accent, p.background)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5);
    });

    it('every template suggests real layouts and palettes, each once', () => {
        for (const key of TEMPLATE_KEYS) {
            const { layouts, palettes } = TEMPLATES[key];
            for (const layout of layouts)
                expect(isLayoutKey(layout)).toBe(true);
            for (const palette of palettes)
                expect(PALETTES[palette]).toBeDefined();
            expect(new Set(layouts).size).toBe(layouts.length);
            expect(new Set(palettes).size).toBe(palettes.length);
        }
    });
});

describe('qr', () => {
    it('makes a square code that grows with the link', () => {
        const short = qrModules('https://example.org');
        const long = qrModules(`https://example.org/${'a'.repeat(200)}`);
        expect(short.length).toBeGreaterThanOrEqual(21);
        expect(short.every((row) => row.length === short.length)).toBe(true);
        expect(long.length).toBeGreaterThan(short.length);
    });
});

const FULL: Record<TextRole, string> = {
    tagline: 'Take what you need. Leave what you can.',
    title: 'Free Store',
    when: 'Saturday, December 5 · 10 AM – 2 PM',
    place: 'St. James Park, San José',
    details: 'Clothes, books, kitchen things and more. Everything is free.',
    host: 'Hosted by South Bay Mutual Aid',
    link: 'communalists.com/organization/sbma',
};

const inside = (e: GraphicElement, w: number, h: number) => {
    if (e.kind === 'text') {
        const height = e.lines.length * e.size * e.lineHeight;
        return (
            e.x >= 0 &&
            e.y >= 0 &&
            e.x + e.w <= w + 0.5 &&
            e.y + height <= h + 0.5
        );
    }
    return e.x >= 0 && e.y >= 0 && e.x + e.w <= w + 0.5 && e.y + e.h <= h + 0.5;
};

const textBoxes = (elements: GraphicElement[]) =>
    elements.flatMap((e) =>
        e.kind === 'text'
            ? [
                  {
                      role: e.role,
                      top: e.y,
                      bottom: e.y + e.lines.length * e.size * e.lineHeight,
                      x: e.x,
                      right: e.x + e.w,
                  },
              ]
            : []
    );

describe('layout specs', () => {
    it.each(LAYOUT_KEYS)('%s is well formed', (key) => {
        const spec = LAYOUTS[key];
        const rest = spec.regions.filter((r) => r.height === 'rest');
        expect(rest.length).toBeLessThanOrEqual(1);
        for (const region of [...spec.regions, ...(spec.withoutPhoto ?? [])]) {
            // Words never sit on a photo.
            if (region.photo)
                expect(
                    [region.start, region.end, region.center]
                        .flat()
                        .filter(Boolean)
                ).toEqual([]);
            if (region.center)
                expect(region.start ?? region.end).toBeUndefined();
        }
        if (usesPhoto(spec)) {
            expect(spec.group).toBe('photo');
            expect(spec.withoutPhoto).toBeDefined();
        } else expect(spec.group).toBe('type');
        // Every word the graphic has is shown somewhere, with and without a photo.
        for (const regions of [
            spec.regions,
            spec.withoutPhoto ?? spec.regions,
        ]) {
            const roles = regions.flatMap((r) =>
                [
                    ...(r.start ?? []),
                    ...(r.end ?? []),
                    ...(r.center ?? []),
                ].flatMap((b) => ('role' in b ? [b.role] : []))
            );
            expect(roles.sort()).toEqual([
                'details',
                'place',
                'tagline',
                'title',
                'when',
            ]);
        }
    });

    it('decorations never sit under the words', () => {
        for (const format of FORMAT_KEYS)
            for (const layout of LAYOUT_KEYS) {
                const result = layoutGraphic(
                    {
                        format,
                        layout,
                        text: FULL,
                        photo: false,
                        photoFocus: 'center',
                        logo: true,
                        qr: 'https://example.org',
                    },
                    fontFake
                );
                const decorations = (LAYOUTS[layout].decorations ?? []).length;
                if (!decorations) continue;
                const texts = textBoxes(result.elements);
                const { width, height } = FORMATS[format];
                // Decorations are the shapes that aren't full-width bands or rules.
                const shapes = result.elements.filter(
                    (e) =>
                        (e.kind === 'circle' || e.kind === 'rect') &&
                        !(e.x === 0 && e.w === width) &&
                        e.h > width * 0.0125
                );
                for (const s of shapes)
                    if (s.kind === 'rect' || s.kind === 'circle')
                        for (const t of texts) {
                            const apart =
                                s.x + s.w <= t.x ||
                                t.right <= s.x ||
                                s.y + s.h <= t.top ||
                                t.bottom <= s.y;
                            expect(
                                apart,
                                `${layout} ${format}: decoration under ${t.role}`
                            ).toBe(true);
                        }
                void height;
            }
    });
});

describe('layoutGraphic', () => {
    const cases = FORMAT_KEYS.flatMap((format) =>
        LAYOUT_KEYS.flatMap((layout) =>
            [true, false].map((photo) => ({ format, layout, photo }))
        )
    );

    it.each(cases)(
        '$format / $layout / photo: $photo stays on the page without overlaps',
        ({ format, layout, photo }) => {
            const result = layoutGraphic(
                {
                    format,
                    layout,
                    text: FULL,
                    photo,
                    photoFocus: 'center',
                    logo: true,
                    qr: 'https://communalists.com/organization/sbma',
                },
                fontFake
            );
            const { width, height } = FORMATS[format];
            expect(result.width).toBe(width);
            expect(result.height).toBe(height);
            for (const e of result.elements)
                expect(inside(e, width, height)).toBe(true);
            expect(result.overflow).toEqual([]);

            // Text blocks in the same column never overlap.
            const boxes = textBoxes(result.elements);
            for (const a of boxes)
                for (const b of boxes) {
                    if (a === b) continue;
                    const sideBySide = a.right <= b.x || b.right <= a.x;
                    const stacked =
                        a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5;
                    expect(
                        sideBySide || stacked,
                        `${a.role} overlaps ${b.role}`
                    ).toBe(true);
                }

            const roles = boxes.map((b) => b.role).sort();
            expect(roles).toEqual([
                'details',
                'host',
                'link',
                'place',
                'tagline',
                'title',
                'when',
            ]);
            expect(result.elements.some((e) => e.kind === 'photo')).toBe(
                photo && usesPhoto(LAYOUTS[layout])
            );

            // Every word is readable on what's behind it, in every palette.
            for (const e of result.elements) {
                if (e.kind !== 'text') continue;
                expect(e.background, `${e.role} sits on a photo`).not.toBe(
                    'photo'
                );
                if (e.background === 'photo') continue;
                for (const [name, p] of Object.entries(PALETTES))
                    expect(
                        contrast(p[e.color], p[e.background]),
                        `${e.role}: ${e.color} on ${e.background} in ${name}`
                    ).toBeGreaterThanOrEqual(4.5);
            }
        }
    );

    it('leaves out what is empty', () => {
        const result = layoutGraphic(
            {
                format: 'square',
                layout: 'bold',
                text: {
                    ...FULL,
                    when: '',
                    place: '',
                    details: '',
                    host: '',
                    link: '',
                },
                photo: false,
                photoFocus: 'center',
                logo: false,
                qr: null,
            },
            fontFake
        );
        expect(textBoxes(result.elements).map((b) => b.role)).toEqual([
            'tagline',
            'title',
        ]);
        expect(
            result.elements.some((e) => e.kind === 'qr' || e.kind === 'logo')
        ).toBe(false);
        // No rule under the headline when there's no info for it to sit on.
        expect(result.elements.filter((e) => e.kind === 'rect')).toHaveLength(
            2
        );
    });

    it('says which text was cut short', () => {
        const result = layoutGraphic(
            {
                format: 'square',
                layout: 'bold',
                text: { ...FULL, details: 'lots of words '.repeat(60) },
                photo: false,
                photoFocus: 'center',
                logo: false,
                qr: null,
            },
            fontFake
        );
        expect(result.overflow).toEqual(['details']);
    });

    it('draws backgrounds first and words over them', () => {
        const result = layoutGraphic(
            {
                format: 'story',
                layout: 'block',
                text: FULL,
                photo: true,
                photoFocus: 'top',
                logo: false,
                qr: null,
            },
            fontFake
        );
        const kinds = result.elements.map((e) => e.kind);
        expect(kinds[0]).toBe('rect');
        expect(kinds.lastIndexOf('rect')).toBeLessThan(kinds.indexOf('photo'));
        expect(kinds.indexOf('photo')).toBeLessThan(kinds.indexOf('text'));
    });
});

describe('graphicText and altText', () => {
    const content = {
        title: ' Free Store ',
        tagline: 'Take what you need',
        date: '2026-12-05',
        startTime: '10:00',
        endTime: '14:00',
        place: 'St. James Park',
        details: 'Clothes\nBooks',
        host: 'South Bay Mutual Aid',
        link: 'communalists.com/organization/sbma',
    };

    it('turns the fields into the words on the graphic', () => {
        const text = graphicText(content, 'en', {
            hostedBy: (n) => `Hosted by ${n}`,
        });
        expect(text.title).toBe('Free Store');
        expect(text.when).toMatch(/^Saturday, December 5 · 10\sAM\s–\s2\sPM$/);
        expect(text.host).toBe('Hosted by South Bay Mutual Aid');
        expect(text.link).toBe('communalists.com/organization/sbma');
    });

    it('leaves out a host line and link when they are empty or not links', () => {
        const text = graphicText(
            { ...content, host: ' ', link: 'not a link' },
            'en',
            { hostedBy: (n) => `Hosted by ${n}` }
        );
        expect(text.host).toBe('');
        expect(text.link).toBe('');
    });

    it('reads every word in order, as sentences', () => {
        const text = graphicText(content, 'en', {
            hostedBy: (n) => `Hosted by ${n}`,
        });
        expect(
            altText(
                'Free store graphic',
                text,
                'QR code to communalists.com/organization/sbma'
            )
        ).toMatch(
            /^Free store graphic\. Take what you need\. Free Store\. Saturday, December 5 · 10\sAM\s–\s2\sPM\. St\. James Park\. Clothes Books\. Hosted by South Bay Mutual Aid\. QR code to communalists\.com\/organization\/sbma\.$/
        );
    });

    it('ends Chinese sentences with a Chinese full stop', () => {
        expect(
            altText(
                '免费商店海报',
                {
                    ...FULL,
                    tagline: '',
                    title: '免费商店',
                    when: '',
                    place: '',
                    details: '',
                    host: '',
                    link: '',
                },
                ''
            )
        ).toBe('免费商店海报。 免费商店。');
    });
});

describe('interpolate', () => {
    it('fills placeholders and leaves unknown ones', () => {
        expect(interpolate('Hosted by {name}', { name: 'SBMA' })).toBe(
            'Hosted by SBMA'
        );
        expect(interpolate('{a} {b}', { a: '1' })).toBe('1 {b}');
    });
});

describe('names in the messages files', () => {
    // The other languages must match English (messages/messages.test.ts).
    it('every layout, colour set and template has a name', async () => {
        const { default: en } = await import('../../../messages/en.json');
        expect(Object.keys(en.Graphics.layout.options).sort()).toEqual(
            [...LAYOUT_KEYS].sort()
        );
        expect(Object.keys(en.Graphics.palette.options).sort()).toEqual(
            [...PALETTE_KEYS].sort()
        );
        expect(Object.keys(en.Graphics.templates).sort()).toEqual(
            [...TEMPLATE_KEYS].sort()
        );
        expect(Object.keys(en.Graphics.copy.templates).sort()).toEqual(
            [...TEMPLATE_KEYS].sort()
        );
    });
});
