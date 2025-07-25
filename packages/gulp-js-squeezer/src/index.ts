import type FileVinyl from 'vinyl';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import { minify } from 'terser';

import type { GulpJsSqueezerOptions } from './types';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

/**
 * A Gulp plugin that can be used to minify JavaScript files.
 *
 * The plugin processes the JavaScript content of each file in the stream, minifying it
 * and logging the results. If the file is not a Buffer, it is skipped.
 *
 * The plugin also provides statistics on the number of files processed and the
 * number of errors encountered.
 *
 * @example
 * import GulpJsSqueezer from "@zilero/gulp-js-squeezer";
 *
 * gulp.src("src/*.js")
 *   .pipe(GulpJsSqueezer())
 *   .pipe(gulp.dest("dist"));
 */
const GulpJsSqueezer = (options: GulpJsSqueezerOptions) => {
  const { minifyOptions = {}, pluginOptions = {} } = { ...defaultOptions, ...options };

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
					const onBeforeModified = pluginOptions.onBeforeMinify ? await pluginOptions.onBeforeMinify(content) : content;

					// Update the content of the file.
					if (onBeforeModified) {
						content = onBeforeModified;
					}

					// Minify the JS content.
					content = (await minify(content, minifyOptions)).code ?? '';

					// onAfterMinify call (if passed).
					const onAfterModified = pluginOptions.onAfterMinify ? await pluginOptions.onAfterMinify(content) : content;

					// Update the content of the file.
					if (onAfterModified) {
						content = onAfterModified;
					}

					// Increasing the counter of processed files.
					fileCount++;

					// Update the contents of the file.
					file.contents = Buffer.from(content);
				} else {
					// Increasing the count of missed files.
					errorCount++;
				}

				if (pluginOptions.logProgress) {
					console.log(`Minified JS file ${file.relative} successfully.`);
				}

				// Increasing the counter of processed files.
				fileCount++;

				return file;
			} catch (error: unknown) {
				console.error(`An error occurred while processing file ${file.relative}.`, error);
			}
		},
		onFinish: async () => {
			try {
				if (pluginOptions.logFinal) {
					console.log(`Total files processed: ${fileCount}, Total errors: ${errorCount} JS file(s).`);
				}
			} catch (error: unknown) {
				console.error(`An error occurred while logging the final result.`, error);
			}
		},
	});
};

export default GulpJsSqueezer;
