import type { Encoder } from '../image-squeezer.types';

import { INPUT_FORMATS } from '../image-squeezer.constants';

const isInputExtension = (extname: string): extname is keyof typeof INPUT_FORMATS =>
  Object.hasOwn(INPUT_FORMATS, extname);

/** The encoder of the source's own format, or undefined for files the plugin does not handle. */
export const getSourceEncoder = (extname: string): Encoder | undefined => {
  const lowerExtname = extname.toLowerCase();

  return isInputExtension(lowerExtname) ? INPUT_FORMATS[lowerExtname] : undefined;
};
