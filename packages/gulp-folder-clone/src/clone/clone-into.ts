import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { syncSourceMapFile } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { CloneIntoInput } from './clone.types';

/** A deep copy of the file (contents and source map included) at the same relative path under `dir`. */
export const cloneInto = ({ original, dir }: CloneIntoInput): Vinyl => {
  // vinyl clones shallowly unless asked: without deep, every copy would share one source map object.
  const copy = original.clone({ deep: true, contents: true });

  copy.path = path.join(original.base, dir, original.relative);

  syncSourceMapFile(copy);

  return copy;
};
