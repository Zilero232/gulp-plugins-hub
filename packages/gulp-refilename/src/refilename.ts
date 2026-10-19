import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, isRelativePathInside, parseOptions, toPosixPath } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { RefilenameOptions } from './refilename.schema';

import { PLUGIN_NAME } from './refilename.constants';
import { refilenameOptionsSchema } from './refilename.schema';
import { getPathParts, renamePath } from './rename';

/**
 * Renames every file in the stream. Pass a new file name, an object of changes or a function of the path parts.
 * Source maps follow the new name.
 *
 * @example
 * src('src/*.js').pipe(refilename({ suffix: '.min' })); // app.js → app.min.js
 * src('src/*.css').pipe(refilename(({ parts }) => ({ dirname: 'styles', stem: parts.stem.toLowerCase() })));
 */
export const refilename = (options: RefilenameOptions): PluginStream => {
  const rename = parseOptions({ name: PLUGIN_NAME, schema: refilenameOptionsSchema, options });

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: async (file) => {
      const { dirname, stem, extname } = await renamePath({ parts: getPathParts(file), rename, file });

      const renamed = path.join(file.base, dirname, `${stem}${extname}`);

      if (!isRelativePathInside(path.relative(file.base, renamed))) {
        throw new Error(`${toPosixPath(file.relative)} would be renamed outside its base: ${renamed}`);
      }

      file.path = renamed;

      if (file.sourceMap) {
        file.sourceMap.file = toPosixPath(file.relative);
      }
    }
  });
};
