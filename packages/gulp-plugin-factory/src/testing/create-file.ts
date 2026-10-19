import path from 'node:path';
import Vinyl from 'vinyl';

import type { CreateFileInput } from './testing.types';

/**
 * Creates a Vinyl file the way `gulp.src` would, for tests: an absolute path under `base` and Buffer contents.
 *
 * @example
 * const file = createFile({ path: 'styles/main.scss', contents: 'a { color: red }' });
 */
export const createFile = ({
  path: relativePath = 'file.txt',
  contents = '',
  cwd = '/project',
  base = path.join(cwd, 'src'),
  sourceMap = false
}: CreateFileInput = {}): Vinyl => {
  const file = new Vinyl({
    cwd,
    base,
    path: path.join(base, relativePath),
    contents: typeof contents === 'string' ? Buffer.from(contents) : contents
  });

  if (sourceMap) {
    file.sourceMap = {
      version: 3,
      file: file.relative,
      names: [],
      mappings: '',
      sources: [file.relative],
      sourcesContent: [file.isBuffer() ? file.contents.toString() : null]
    };
  }

  return file;
};
