// QR codes, made in the browser (qrcode-generator, MIT): the link never goes
// to a QR service.

import qrcode from 'qrcode-generator';

/** The code's squares, row by row: `true` is dark. */
export function qrModules(text: string): boolean[][] {
    // Level M survives a scuffed or folded flyer and keeps the code small.
    const code = qrcode(0, 'M');
    code.addData(text, 'Byte');
    code.make();
    const count = code.getModuleCount();
    return Array.from({ length: count }, (_, row) =>
        Array.from({ length: count }, (_, col) => code.isDark(row, col))
    );
}

/** Blank squares a scanner needs around the code. */
export const QR_QUIET_ZONE = 4;
