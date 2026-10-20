import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import path from 'node:path';
import { isString } from 'remeda';

import type { FileChangedOptions } from './file-changed.schema';

import { getComparer } from './compare';
import { createExtraMtime } from './extra';
import { PLUGIN_NAME } from './file-changed.constants';
import { fileChangedOptionsSchema } from './file-changed.schema';
import { getTargetPath, statTarget } from './target';

/**
 * Lets through only the files that changed since the last build: the built file in `dest` is missing, older
 * (`mtime`) or different (`contents`), or older than the newest of the `extra` files. Put it right after `src` so a watch build skips the rest of the pipeline
 * for untouched files.
 *
 * Not for plugins that combine files (concat, archives): they need every file, not only the changed ones.
 *
 * @example
 * src('src/images/**', { encoding: false })
 *   .pipe(fileChanged({ dest: 'dist/images' }))
 *   .pipe(imageSqueezer())
 *   .pipe(dest('dist/images'));
 */
export const fileChanged = (options: FileChangedOptions): PluginStream => {
  const { dest, extname, target, extra, compare } = parseOptions({
    name: PLUGIN_NAME,
    schema: fileChangedOptionsSchema,
    options
  });

  const changed = getComparer(compare);
  const getExtraMtime = createExtraMtime(extra === undefined ? [] : [extra].flat());

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: async (file) => {
      if (file.isDirectory()) {
        return;
      }

      const destination = path.resolve(file.cwd, isString(dest) ? dest : dest({ file }));
      const targetPath = getTargetPath({ file, destination, extname, target });
      const targetStat = await statTarget(targetPath);

      if (!targetStat) {
        return;
      }

      const extraMtime = await getExtraMtime(file.cwd);

      // Whole milliseconds, as in the `mtime` comparison: `dest` keeps no fraction.
      if (extraMtime !== undefined && Math.floor(extraMtime) > Math.round(targetStat.mtimeMs)) {
        return;
      }

      if (!(await changed({ file, target: { path: targetPath, stat: targetStat } }))) {
        return null;
      }
    }
  });
};
