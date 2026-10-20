import type { AssertBinaryContentsInput } from './binary.types';

import { toPosixPath } from '../path';
import { HEADER_LENGTH, REPLACEMENT_CHARACTER } from './binary.constants';

/**
 * Throws when a binary file looks like it was read as UTF-8 text, which is what `gulp.src` does by default
 * since gulp 5: every byte above 0x7F in the header became U+FFFD. Call it first in plugins for images, fonts
 * and other binary formats, so the user gets the fix instead of a decoder error.
 */
export const assertBinaryContents = ({ relative, contents }: AssertBinaryContentsInput): void => {
  if (contents.subarray(0, HEADER_LENGTH).includes(REPLACEMENT_CHARACTER)) {
    throw new Error(
      `${toPosixPath(relative)} was read as UTF-8 text and is corrupted. Read binary files with \`src(globs, { encoding: false })\``
    );
  }
};
