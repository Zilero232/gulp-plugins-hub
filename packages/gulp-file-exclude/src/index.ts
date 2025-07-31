import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import type { GulpFileExcludeOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { isFileExcluded } from './utils/isFileExcluded';
import { checkFileSize } from './utils/checkFileSize';

import { gulpFileExcludeSchema } from './schema';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpFileExcludeSchema,
  defaults: defaultOptions,
});

// Creates a Gulp plugin that excludes files based on patterns.
const GulpFileExclude = (options: GulpFileExcludeOptions) => {
  const { patterns, size, onExclude } = validateOptions(options);

  return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      try {
        const filePath = file.basename;

        // Check if file is excluded by size
        const isSizeExcluded = checkFileSize({ file, size });
        if (isSizeExcluded) {
          return;
        }

        // Check if file is excluded by pattern
        const isPatternExcluded = isFileExcluded({ filePath, patterns });
        if (isPatternExcluded) {
          return;
        }

        // Check if file is excluded by onExclude
        const isOnExcludeExcluded = onExclude && await onExclude(file);
        if (isOnExcludeExcluded) {
          return;
        }

        return file;
      } catch (error: unknown) {
        throw new Error(`An error occurred during file exclusion.`, { cause: error });
      }
    },
  });
};

export default GulpFileExclude;
