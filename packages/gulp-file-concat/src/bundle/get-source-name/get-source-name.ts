import { toPosixPath } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { GetSourceNameInput } from './get-source-name.types';

/** The name of an input inside the bundle and its source map: its path relative to the bundle's base. */
export const getSourceName = ({ base, filePath }: GetSourceNameInput): string =>
  toPosixPath(path.relative(base, filePath));
