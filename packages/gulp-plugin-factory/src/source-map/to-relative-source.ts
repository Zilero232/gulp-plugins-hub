import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ToRelativeSourceInput } from './source-map.types';

import { toPosixPath } from '../shared';

/**
 * An absolute or `file://` source relative to the base, with `/` separators; a relative source gets `/`
 * separators too (tools given `file.relative` on Windows write backslashes). `data:` and URLs stay as they are.
 */
export const toRelativeSource = ({ base, source }: ToRelativeSourceInput): string => {
  if (source.startsWith('file://')) {
    return toPosixPath(path.relative(base, fileURLToPath(source)));
  }

  if (path.isAbsolute(source)) {
    return toPosixPath(path.relative(base, source));
  }

  if (/^[a-z][\w+.-]*:/i.test(source)) {
    return source;
  }

  return toPosixPath(source);
};
