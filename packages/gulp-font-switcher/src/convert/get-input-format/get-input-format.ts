import type { InputFontFormat } from '../../font-switcher.types';

import { INPUT_FORMATS } from '../../font-switcher.constants';

const isInputExtension = (extname: string): extname is keyof typeof INPUT_FORMATS =>
  Object.hasOwn(INPUT_FORMATS, extname);

/** The font format of an extension, in any case; undefined for other files. */
export const getInputFormat = (extname: string): InputFontFormat | undefined => {
  const lowerExtname = extname.toLowerCase();

  return isInputExtension(lowerExtname) ? INPUT_FORMATS[lowerExtname] : undefined;
};
