import type { FontFormat } from '../../font-switcher.types';

export type WriteFormatInput = {
  /** The font as sfnt (ttf or otf). */
  sfnt: Buffer;
  format: FontFormat;
  /** Keep the hinting instructions in the formats fonteditor-core rebuilds. */
  hinting: boolean;
};
