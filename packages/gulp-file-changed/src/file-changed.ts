import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { FileChangedOptions } from './file-changed.schema';

import { getComparer } from './compare';
import { PLUGIN_NAME } from './file-changed.constants';
import { fileChangedOptionsSchema } from './file-changed.schema';
import { getTargetPath, statTarget } from './target';

/**
 * Lets through only the files that changed since the last build: the built file in `dest` is missing, older
 * (`mtime`) or different (`contents`). Put it right after `src` so a watch build skips the rest of the pipeline
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
  const { dest, extname, target, compare } = parseOptions({
    name: PLUGIN_NAME,
    schema: fileChangedOptionsSchema,
    options
  });
  const changed = getComparer(compare);

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: async (file) => {
      if (file.isDirectory()) {
        return;
      }

      const destination = path.resolve(file.cwd, typeof dest === 'function' ? dest({ file }) : dest);
      const targetPath = getTargetPath({ file, destination, extname, target });
      const targetStat = await statTarget(targetPath);

      if (!targetStat) {
        return;
      }

      if (!(await changed({ file, target: { path: targetPath, stat: targetStat } }))) {
        return null;
      }
    }
  });
};
