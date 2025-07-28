import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpRefilenameSchema, type GulpRefilenameOptions } from './schema';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpRefilenameSchema,
});

// A Gulp plugin that can be used to rename files.
const GulpRefilename = (options: GulpRefilenameOptions) => {
  const pluginOptions = validateOptions(options);

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			let newFileName: string = '';

			// Logic based on the type of `options`.
			if (typeof pluginOptions === 'string') {
				newFileName = pluginOptions; // Simple renaming.
			} else if (typeof pluginOptions === 'object') {
				const { prefix = '', suffix = '', extname = file.extname, dirname = file.dirname, multiExt = false } = pluginOptions;

				// Forming a new file name.
				const baseName = multiExt ? file.relative.replace(/(\.[^/.]+)+$/, '') : file.stem;

				// Forming a new file name.
				newFileName = `${dirname}/${prefix}${baseName}${suffix}${extname}`;
			}

			// Setting a new file path.
			file.path = file.base + newFileName;

			// Renaming the sourcemap, if it exists.
			if (file.sourceMap) {
				file.sourceMap.file = newFileName;
			}

			return file;
		},
	});
};

export default GulpRefilename;
