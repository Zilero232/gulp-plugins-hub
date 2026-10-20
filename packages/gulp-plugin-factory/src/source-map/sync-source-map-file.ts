import type Vinyl from 'vinyl';

import { toPosixPath } from '../path';

/**
 * Points `file.sourceMap.file` at the file's current name: call it after renaming or moving a file, so `dest`
 * writes the map for the right file. Files without a map are left alone.
 */
export const syncSourceMapFile = (file: Vinyl): void => {
  if (file.sourceMap) {
    file.sourceMap.file = toPosixPath(file.relative);
  }
};
