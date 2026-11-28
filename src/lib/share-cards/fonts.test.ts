import { describe, expect, it } from 'vitest';

import { fontFilesFor, parseFontsourceCss, parseUnicodeRange } from './fonts';

describe('parseUnicodeRange', () => {
    it('reads single code points and ranges', () => {
        expect(parseUnicodeRange('U+0000-00FF, U+0131,U+4e00-4e10')).toEqual([
            [0, 255],
            [0x131, 0x131],
            [0x4e00, 0x4e10],
        ]);
    });
});

describe('parseFontsourceCss', () => {
    it('takes the woff file and its range from each block', () => {
        const css = `/* latin */
@font-face {
  font-family: 'Noto Sans';
  src: url(./files/noto-sans-latin-600-normal.woff2) format('woff2'), url(./files/noto-sans-latin-600-normal.woff) format('woff');
  unicode-range: U+0000-00FF,U+0131;
}
/* vietnamese */
@font-face {
  src: url(./files/noto-sans-vietnamese-600-normal.woff2) format('woff2'), url(./files/noto-sans-vietnamese-600-normal.woff) format('woff');
  unicode-range: U+0102-0103,U+1EA0-1EF9;
}`;
        expect(parseFontsourceCss(css)).toEqual([
            {
                file: 'noto-sans-latin-600-normal.woff',
                ranges: [
                    [0, 255],
                    [0x131, 0x131],
                ],
            },
            {
                file: 'noto-sans-vietnamese-600-normal.woff',
                ranges: [
                    [0x102, 0x103],
                    [0x1ea0, 0x1ef9],
                ],
            },
        ]);
    });
});

describe('fontFilesFor', () => {
    const fonts = [
        { file: 'latin', ranges: [[0x20, 0xff]] as [number, number][] },
        { file: 'vi', ranges: [[0x1ea0, 0x1ef9]] as [number, number][] },
        { file: 'sc-1', ranges: [[0x738b, 0x738b]] as [number, number][] },
        { file: 'sc-2', ranges: [[0x5c0f, 0x5c0f]] as [number, number][] },
    ];

    it('picks only the files the text uses, in font order', () => {
        expect(fontFilesFor('Maya', fonts)).toEqual(['latin']);
        expect(fontFilesFor('Thanh Nguyễn', fonts)).toEqual(['latin', 'vi']);
        expect(fontFilesFor('王小', fonts)).toEqual(['sc-1', 'sc-2']);
    });

    it('skips characters nothing covers', () => {
        expect(fontFilesFor('🙂', fonts)).toEqual([]);
    });
});
