import { createFont } from 'fonteditor-core';

import type { ReadSfntInput } from './convert.types';

import { fontverter } from '../vendor';

/**
 * The font as sfnt. ttf, otf, woff and woff2 are unpacked as they are, every table kept. EOT and SVG fonts, legacy
 * formats fontverter does not read, go through fonteditor-core, which rebuilds the font from its glyphs.
 */
export const readSfnt = async ({ contents, format }: ReadSfntInput): Promise<Buffer> => {
  if (format === 'eot' || format === 'svg') {
    const font = createFont(format === 'svg' ? contents.toString() : contents, { type: format });

    return Buffer.from(font.write({ type: 'ttf', toBuffer: true }));
  }

  return fontverter.convert(contents, 'sfnt');
};
