import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import { minify } from 'html-minifier-terser';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpHtmlSqueezerSchema, type GulpHtmlSqueezerOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpHtmlSqueezerSchema,
  defaults: defaultOptions,
});

// A Gulp plugin that can be used to minify HTML files.
const GulpHtmlSqueezer = (options: GulpHtmlSqueezerOptions) => {
  const { htmlMinifierOptions = {}, pluginOptions = {} } = validateOptions(options);

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				if (file.isBuffer()) {
					// Get the content of the file.
					let content = file.contents.toString();

          if (pluginOptions.onBeforeMinify) {
            // onBeforeMinify call (if passed).
            content = await pluginOptions.onBeforeMinify(content);
          }

					// Minify the HTML content.
					content = await minify(content, htmlMinifierOptions);

          if (pluginOptions.onAfterMinify) {
            // onAfterMinify call (if passed).
            content = await pluginOptions.onAfterMinify(content);
          }

					// Update the contents of the file.
					file.contents = Buffer.from(content);
				}

				return file;
			} catch (error: unknown) {
				throw new Error(`An error occurred while processing file ${file.relative}.`, { cause: error });
			}
		},
	});
};

export default GulpHtmlSqueezer;
