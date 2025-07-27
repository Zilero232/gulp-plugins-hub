import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from "@zilero/gulp-plugin-factory";
import { render } from 'pug';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpPugCompilerSchema, type GulpPugCompilerOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpPugCompilerSchema,
  defaults: defaultOptions,
});

/**
 * A Gulp plugin that can be used to compile PUG files.
 *
 * The plugin checks for the presence of a .pug file extension and compiles the
 * PUG content into HTML. It also supports the use of functions onBeforeCompile
 * and onAfterCompile to modify the content of the file before and after the
 * compilation process.
 *
 * @example
 * import GulpPugCompiler from "@zilero/gulp-pug-compiler";
 *
 * gulp.src("src/*.pug")
 *   .pipe(GulpPugCompiler())
 *   .pipe(gulp.dest("dist"));
 */
const GulpPugCompiler = (options: GulpPugCompilerOptions) => {
  const { pugOptions = {}, pluginOptions = {} } = validateOptions(options);

	let fileCount = 0; // Counter of processed files.
	let errorCount = 0; // Error Counter.

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				if (file.isBuffer()) {
					// Get the content of the file.
					let content = file.contents.toString();

					// onBeforeMinify call (if passed).
					const onBeforeCompiled = pluginOptions.onBeforeCompile ? await pluginOptions.onBeforeCompile(content) : content;

					// Update the content of the file.
					if (onBeforeCompiled) {
						content = onBeforeCompiled;
					}

					// Compiling the PUG content.
					content = render(content, pugOptions);

					// onAfterMinify call (if passed).
					const onAfterCompiled = pluginOptions.onAfterCompile ? await pluginOptions.onAfterCompile(content) : content;

					// Update the content of the file.
					if (onAfterCompiled) {
						content = onAfterCompiled;
					}

					// Update the contents of the file.
					file.contents = Buffer.from(content);

					// Update the extension of the file on .html.
					file.extname = '.html';
				} else {
					// Increasing the count of missed files.
					errorCount++;
				}

				if (pluginOptions.logProgress) {
          console.log(`Minified PUG file ${file.relative} successfully.`);
				}

				// Increasing the counter of processed files.
				fileCount += 1;

				return file;
			} catch (error: unknown) {
        throw new Error(`An error occurred while processing file ${file.relative}.`, { cause: error });
			}
		},
		onFinish: async () => {
      try {
        // Log the final result.
        if (pluginOptions.logFinal) {
          console.log(`Total files processed: ${fileCount}, Total errors: ${errorCount} PUG file(s).`);
        }
      } catch (error: unknown) {
        throw new Error(`An error occurred while logging the final result.`, { cause: error });
      }
		},
	});
};

export default GulpPugCompiler;
