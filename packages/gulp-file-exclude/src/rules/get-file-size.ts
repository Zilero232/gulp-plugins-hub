import type { Vinyl } from '@zilero/gulp-plugin-factory';

/**
 * The size of the contents, or of the file on disk for files read without contents. Undefined when unknown and
 * for directories, which a size range never drops.
 */
export const getFileSize = (file: Vinyl): number | undefined => {
  if (file.isDirectory()) {
    return undefined;
  }

  return file.isBuffer() ? file.contents.length : file.stat?.size;
};
