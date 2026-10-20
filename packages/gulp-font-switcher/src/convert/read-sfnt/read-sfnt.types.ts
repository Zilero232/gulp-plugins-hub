import type { InputFontFormat } from '../../font-switcher.types';

export type ReadSfntInput = {
  contents: Buffer;
  format: InputFontFormat;
};
