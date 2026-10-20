import type Vinyl from 'vinyl';

import { toPosixPath } from '../path';

/**
 * The file's path relative to its base with `/` separators, so tests compare the same string on every OS.
 *
 * @example
 * expect(output.map(getRelativePath)).toEqual(['js/app.min.js']);
 */
export const getRelativePath = (file: Vinyl | undefined): string => {
  if (!file) {
    throw new Error('Expected a file, got nothing');
  }

  return toPosixPath(file.relative);
};
