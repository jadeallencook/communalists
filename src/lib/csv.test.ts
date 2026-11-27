import { describe, expect, it } from 'vitest';

import { parseCsv, toCsv } from './csv';

describe('parseCsv', () => {
    it('reads quoted commas, escaped quotes and line breaks', () => {
        expect(parseCsv('a,b\r\n"x, y","say ""hi""\nthere"\n\n')).toEqual([
            ['a', 'b'],
            ['x, y', 'say "hi"\nthere'],
        ]);
    });

    it('drops a byte-order mark and keeps empty cells', () => {
        expect(parseCsv('﻿a,b,c\n1,,3')).toEqual([
            ['a', 'b', 'c'],
            ['1', '', '3'],
        ]);
    });
});

describe('toCsv', () => {
    it('quotes only cells that need it, and reads back the same', () => {
        const rows = [['plain', 'a, b', 'say "hi"', 'two\nlines', '']];
        const text = toCsv(['h1', 'h2', 'h3', 'h4', 'h5'], rows);
        expect(text).toBe(
            'h1,h2,h3,h4,h5\nplain,"a, b","say ""hi""","two\nlines",\n'
        );
        expect(parseCsv(text)).toEqual([
            ['h1', 'h2', 'h3', 'h4', 'h5'],
            ...rows,
        ]);
    });
});
