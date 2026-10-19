import type { Syntax } from 'sass-embedded';

import { SYNTAXES } from '../scss-compiler.constants';

const isSassExtension = (extname: string): extname is keyof typeof SYNTAXES => Object.hasOwn(SYNTAXES, extname);

/** The Sass syntax of an extension, in any case; undefined for files the plugin passes through. */
export const getSyntax = (extname: string): Syntax | undefined => {
  const lowerExtname = extname.toLowerCase();

  return isSassExtension(lowerExtname) ? SYNTAXES[lowerExtname] : undefined;
};
