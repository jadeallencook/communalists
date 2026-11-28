// Wrapping and shrinking text to fit a box. Pure: the width of a piece of
// text comes from `measure`, which the browser backs with a canvas and tests
// back with a fake. Chinese has no spaces, so it can break between any two
// characters; other words only break when one is wider than the whole line.

/** Width of `text` drawn at `size` pixels. */
export type Measure = (text: string, size: number) => number;

/** Chinese, Japanese and Korean characters, and their punctuation. */
export const CJK = /[⺀-鿿豈-﫿＀-￯　-〿]/;
const TOKEN = /[⺀-鿿豈-﫿＀-￯　-〿]|[^\s⺀-鿿豈-﫿＀-￯　-〿]+|\s+/g;

export function tokenize(text: string): string[] {
    return text.match(TOKEN) ?? [];
}

export interface Wrapped {
    lines: string[];
    /** A word had to be split because it was wider than the line. */
    broke: boolean;
}

function wrapParagraph(
    paragraph: string,
    width: number,
    measure: (text: string) => number
): Wrapped {
    const lines: string[] = [];
    let line = '';
    let broke = false;
    for (const token of tokenize(paragraph)) {
        if (/^\s+$/.test(token)) {
            if (line) line += ' ';
            continue;
        }
        const candidate = line + token;
        if (measure(candidate.trimStart()) <= width) {
            line = candidate;
            continue;
        }
        if (line.trim()) lines.push(line.trim());
        line = '';
        if (measure(token) <= width) {
            line = token;
            continue;
        }
        broke = true;
        for (const char of token) {
            if (!line || measure(line + char) <= width) line += char;
            else {
                lines.push(line);
                line = char;
            }
        }
    }
    if (line.trim()) lines.push(line.trim());
    return { lines, broke };
}

/** Lines of `text` no wider than `width`. Line breaks typed in are kept (blank lines collapse to one). */
export function wrap(
    text: string,
    width: number,
    measure: (text: string) => number
): Wrapped {
    const lines: string[] = [];
    let broke = false;
    // Odd entries are the line breaks between paragraphs.
    const parts = text.trim().split(/(\n\s*\n+|\n)/);
    for (let i = 0; i < parts.length; i += 2) {
        const result = wrapParagraph(parts[i], width, measure);
        broke ||= result.broke;
        lines.push(...result.lines);
        const separator = parts[i + 1];
        if (separator && /\n\s*\n/.test(separator)) lines.push('');
    }
    return { lines, broke };
}

export interface FitOptions {
    text: string;
    width: number;
    height: number;
    maxSize: number;
    minSize: number;
    /** Line height as a multiple of the size. */
    lineHeight: number;
    maxLines: number;
    measure: Measure;
}

export interface Fitted {
    size: number;
    lines: string[];
    /** Height the lines take. */
    height: number;
    /** Even at the smallest size it didn't fit, so the end was cut off. */
    overflow: boolean;
}

const ELLIPSIS = '…';

/**
 * The largest size (from `maxSize` down to `minSize`) at which `text` fits
 * the box, preferring sizes that don't split words. If it doesn't fit even
 * at `minSize`, the lines that fit are kept and the last ends in "…".
 */
export function fitText(options: FitOptions): Fitted {
    const { text, width, height, maxSize, minSize, lineHeight, maxLines } =
        options;
    if (!text.trim())
        return { size: maxSize, lines: [], height: 0, overflow: false };
    const at = (size: number) =>
        wrap(text, width, (t) => options.measure(t, size));
    const fits = (lines: string[], size: number) =>
        lines.length <= maxLines && lines.length * size * lineHeight <= height;

    let fallback: { size: number; lines: string[] } | null = null;
    for (let size = maxSize; size >= minSize; size = size * 0.95) {
        const { lines, broke } = at(size);
        if (!fits(lines, size)) continue;
        if (!broke) return done(size, lines, lineHeight, false);
        fallback ??= { size, lines };
        if (size * 0.95 < minSize) break;
    }
    if (fallback) return done(fallback.size, fallback.lines, lineHeight, false);

    // Doesn't fit at the smallest size: keep what fits and end in "…".
    const size = minSize;
    const { lines } = at(size);
    const room = Math.max(
        1,
        Math.min(maxLines, Math.floor(height / (size * lineHeight)))
    );
    const kept = lines.slice(0, room);
    let last = kept[kept.length - 1] ?? '';
    while (last && options.measure(last + ELLIPSIS, size) > width)
        last = [...last].slice(0, -1).join('').trimEnd();
    kept[kept.length - 1] = last + ELLIPSIS;
    return done(size, kept, lineHeight, true);
}

function done(
    size: number,
    lines: string[],
    lineHeight: number,
    overflow: boolean
): Fitted {
    return { size, lines, height: lines.length * size * lineHeight, overflow };
}
