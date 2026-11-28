// Which font files a share card needs (pure, tested). The cards bundle their
// own fonts (Noto Sans and Noto Sans SC from @fontsource), so drawing a name
// never sends its characters to a font service (decision #72). Fontsource
// splits each font into files by `unicode-range`; a card loads only the
// files its text uses.

/** One font file and the characters it covers, as [from, to] code points. */
export interface FontFile {
    file: string;
    ranges: [number, number][];
}

/** Reads `unicode-range: U+0-ff,U+131,U+4e00-4e10;` into [from, to] pairs. */
export function parseUnicodeRange(value: string): [number, number][] {
    return value
        .split(',')
        .map((part) => part.trim().replace(/^U\+/i, ''))
        .filter(Boolean)
        .map((part) => {
            const [from, to = from] = part.split('-');
            return [parseInt(from, 16), parseInt(to, 16)] as [number, number];
        })
        .filter(([from, to]) => Number.isFinite(from) && Number.isFinite(to));
}

/**
 * The `.woff` files and ranges in a fontsource CSS file (like
 * `@fontsource/noto-sans/600.css`). Satori reads woff, not woff2.
 */
export function parseFontsourceCss(css: string): FontFile[] {
    const files: FontFile[] = [];
    for (const block of css.split('@font-face').slice(1)) {
        const file = block.match(/url\(\.\/files\/([^)]+\.woff)\)/)?.[1];
        const range = block.match(/unicode-range:\s*([^;]+);/)?.[1];
        if (file && range)
            files.push({ file, ranges: parseUnicodeRange(range) });
    }
    return files;
}

const covers = (font: FontFile, code: number) =>
    font.ranges.some(([from, to]) => code >= from && code <= to);

/**
 * The files needed to draw `text`, in the order given (so earlier fonts win
 * when two cover a character). Characters no file covers are left to the
 * drawing library, which skips them.
 */
export function fontFilesFor(text: string, fonts: FontFile[]): string[] {
    const needed = new Set<string>();
    for (const char of new Set(text)) {
        const code = char.codePointAt(0)!;
        if (/\s/.test(char)) continue;
        const font = fonts.find((f) => covers(f, code));
        if (font) needed.add(font.file);
    }
    return fonts.map((f) => f.file).filter((file) => needed.has(file));
}
