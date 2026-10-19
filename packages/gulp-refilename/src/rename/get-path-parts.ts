import type { Vinyl } from '@zilero/gulp-plugin-factory';

import path from 'node:path';

import type { PathParts } from '../refilename.types';

/** The parts of a path relative to its base. */
export const getPathParts = (file: Vinyl): PathParts => ({
  dirname: path.dirname(file.relative),
  stem: file.stem,
  extname: file.extname
});
