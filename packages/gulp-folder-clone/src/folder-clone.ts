import type { PluginStream, Vinyl } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions, syncSourceMapFile } from '@zilero/gulp-plugin-factory';

import type { FolderCloneOptions } from './folder-clone.schema';

import { cloneInto } from './clone';
import { PLUGIN_NAME } from './folder-clone.constants';
import { folderCloneOptionsSchema } from './folder-clone.schema';

/**
 * Copies every file of the stream into one or more extra folders, relative to `file.base`, so a single `dest`
 * writes them all. The originals are kept unless `keepOriginal` is false.
 *
 * @example
 * // dist/images/logo.png, dist/backup/images/logo.png and dist/v2/images/logo.png
 * src('src/images/**', { base: 'src', encoding: false })
 *   .pipe(folderClone({ dirs: ['backup', 'v2'] }))
 *   .pipe(dest('dist'));
 */
export const folderClone = (options: FolderCloneOptions): PluginStream => {
  const { dirs, keepOriginal, onClone } = parseOptions({
    name: PLUGIN_NAME,
    schema: folderCloneOptionsSchema,
    options
  });

  const targets = [dirs].flat();

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: async (original) => {
      const output: Vinyl[] = keepOriginal ? [original] : [];

      for (const dir of targets) {
        const copy = cloneInto({ original, dir });
        const result = onClone ? await onClone({ file: copy, dir, original }) : undefined;

        if (result === null) {
          continue;
        }

        const file = result ?? copy;

        // The hook may have renamed or moved the copy: its map must name the file dest writes.
        syncSourceMapFile(file);

        output.push(file);
      }

      return output;
    }
  });
};
