// "Ada Lovelace" → "AL", "ada" → "A", "王小明" → "王", "Ángela Ruiz" → "ÁR".
// Pure, so the header, a future native app and tests share it.

const graphemes = (text: string): string[] =>
    [
        ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(
            text
        ),
    ].map((s) => s.segment);

export function initials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    const first = graphemes(words[0])[0] ?? '';
    // Scripts without letter case (Chinese, Vietnamese names written in
    // Han, etc.) read better as a single character.
    if (first.toUpperCase() === first.toLowerCase()) return first;
    const last = words.length > 1 ? (graphemes(words.at(-1)!)[0] ?? '') : '';
    return (first + last).toLocaleUpperCase();
}
