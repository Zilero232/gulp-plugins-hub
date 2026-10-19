import type { FontFormat, InputFontFormat } from '../font-switcher.types';

export type ReadSfntInput = {
  contents: Buffer;
  format: InputFontFormat;
};

export type WriteFormatInput = {
  /** The font as sfnt (ttf or otf). */
  sfnt: Buffer;
  format: FontFormat;
  /** Keep the hinting instructions in the formats fonteditor-core rebuilds. */
  hinting: boolean;
};
