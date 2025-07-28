import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';


import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpRefilenameSchema, type GulpRefilenameOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpRefilenameSchema,
  defaults: defaultOptions,
});

// A Gulp plugin that can be used to rename files.
const GulpRefilename = (options: GulpRefilenameOptions) => {
  const pluginOptions = validateOptions(options);

	return GulpPluginFactory({
    pluginName: PLUGIN_NAME,
    onFile: async (file: FileVinyl) => {
      // Simple rename if options is string
      if (typeof pluginOptions === 'string') {
        file.stem = pluginOptions;

      // Complex rename if options is object
      } else {
        const { dirname, stem, extname, prefix, suffix } = pluginOptions || {};

        // Get base name considering multiple extensions
        const baseName = stem || file.stem;

        // Set new filename with prefix and suffix
        file.stem = `${prefix}${baseName}${suffix}`;

        // Update extension if provided
        if (extname) {
          file.extname = extname.startsWith('.') ? extname : `.${extname}`;
        }

        // Update directory if provided
        if (dirname) {
          file.dirname = dirname;
        }
      }

      // Update sourcemap if exists
      if (file.sourceMap) {
        file.sourceMap.file = file.relative;
      }

      return file;
    },
  });
};

export default GulpRefilename;
