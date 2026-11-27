// CSV reading and writing, shared by the organization and dictionary imports.
// No imports and only erasable TypeScript, so scripts/seed.mjs can import it
// directly (Node strips the types).

/**
 * RFC 4180 CSV: quoted fields may hold commas, quotes ("") and line breaks.
 * Accepts CRLF or LF and a leading byte-order mark. Blank lines are dropped.
 */
export function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;
    const source = text.replace(/^﻿/, '');
    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        if (quoted) {
            if (char === '"' && source[i + 1] === '"') {
                field += '"';
                i++;
            } else if (char === '"') quoted = false;
            else field += char;
        } else if (char === '"' && field === '') quoted = true;
        else if (char === ',') {
            row.push(field);
            field = '';
        } else if (char === '\n' || char === '\r') {
            if (char === '\r' && source[i + 1] === '\n') i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else field += char;
    }
    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** One cell, quoted when it holds a comma, quote or line break. */
export const csvCell = (value = '') =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/** A header row and rows of cells as CSV text, ending with a line break. */
export function toCsv(header: readonly string[], rows: string[][]): string {
    return [header, ...rows]
        .map((cells) => cells.map((c) => csvCell(c)).join(','))
        .join('\n')
        .concat('\n');
}
