import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from "@zilero/gulp-plugin-factory";
import { compileFile } from 'pug';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpPugCompilerSchema, type GulpPugCompilerOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpPugCompilerSchema,
  defaults: defaultOptions,
});

// A Gulp plugin that can be used to compile PUG files.
const GulpPugCompiler = (options: GulpPugCompilerOptions) => {
  const { pugOptions = {}, pluginOptions = {} } = validateOptions(options);

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				if (file.isBuffer()) {
					 // Compile the file directly
           const template = compileFile(file.path, {
            ...pugOptions,
            filename: file.path,
            basedir: file.base
          });

          // Render with options
          let content = template();

					// onAfterCompile call (if passed).
          if (pluginOptions.onAfterCompile) {
            const processed = await pluginOptions.onAfterCompile(content);

            if (processed) {
              content = processed;
            }
          }

					// Update the contents of the file.
					file.contents = Buffer.from(content);

					// Update the extension of the file on .html.
					file.extname = '.html';
				}

				return file;
			} catch (error: unknown) {
        throw new Error(`An error occurred while processing file ${file.relative}.`, { cause: error });
			}
		}
	});
};

export default GulpPugCompiler;
