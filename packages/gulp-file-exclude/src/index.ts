import type FileVinyl from 'vinyl';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';

import type { GulpFileExcludeOptions } from './types';

import defaultOptions from './config/PluginOptionsDefault';

import { isFileExcluded } from './utils/isFileExcluded';
import { checkFileSize } from './utils/checkFileSize';

import { PLUGIN_NAME } from './constants';

/**
 * Creates a Gulp plugin that excludes files based on patterns.
 *
 * @example
 * import GulpFileExclude from '@zilero/gulp-file-exclude';
 *
 * // Exclude files by patterns
 * gulp.src("src/images/*.png")
 *   .pipe(GulpFileExclude({
 *     patterns: [
 *       '.test.',
 *       /\.spec\./,
 *     ],
 *     size: [
 *       10, // min size in bytes
 *       100, // max size in bytes
 *     ],
 *     onExclude: async (file) => {
 *       return true;
 *     },
 *   }))
 *   .pipe(gulp.dest("dist/images"));
 */
const GulpFileExclude = (options: GulpFileExcludeOptions = {}) => {
  const { patterns = [], logExcluded, size, onExclude } = { ...defaultOptions, ...options };

  let excludedCount = 0;

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      try {
        const filePath = file.basename;

        // Check if file is excluded by size
        const isSizeExcluded = checkFileSize({ file, size });
        if (isSizeExcluded) {
          excludedCount++;

          return console.info(`Excluding file: ${filePath} by size`);
        }

        // Check if file is excluded by pattern
        const isPatternExcluded = isFileExcluded({ filePath, patterns });
        if (isPatternExcluded) {
          excludedCount++;

          return console.info(`Excluding file: ${filePath} by pattern`);
        }

        // Check if file is excluded by onExclude
        const isOnExcludeExcluded = onExclude && await onExclude(file);
        if (isOnExcludeExcluded) {
          excludedCount++;

          return console.info(`Excluding by onExclude file: ${filePath}`);
        }

        return file;
      } catch (error: unknown) {
        console.error('An error occurred during file exclusion', error);
      }
    },
    onFinish: async () => {
      if (logExcluded) {
        console.log(`Total files excluded: ${excludedCount}`);
      }
    },
  });
};

export default GulpFileExclude;
