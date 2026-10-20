import type Vinyl from 'vinyl';

/**
 * The Buffer contents of a file emitted by a plugin; throws when the file has none, so tests need no casts.
 *
 * @example
 * expect(getContents(output).toString()).toBe('a{}');
 */
export const getContents = (file: Vinyl | undefined): Buffer => {
  if (!file?.isBuffer()) {
    throw new Error(`Expected a file with Buffer contents, got ${file ? 'another file' : 'nothing'}`);
  }

  return file.contents;
};
