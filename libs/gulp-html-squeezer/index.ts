import { minify } from 'html-minifier-terser';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { handleUnknownError } from '@shared/utils';
import { isFunction, isString } from '@shared/helpers/typeHelpers';

import type { GulpHtmlSqueezerOptions } from './types';

import { PLUGIN_NAME } from './constants';

/**
 * A Gulp plugin that can be used to minify HTML files.
 *
 * The plugin processes the HTML content of each file in the stream, minifying it
 * and logging the results. If the file is not a Buffer, it is skipped.
 *
 * The plugin also provides statistics on the number of files processed and the
 * number of errors encountered.
 *
 * @param {GulpHtmlSqueezerOptions} options - The options for the plugin.
 *
 * @returns {TransformStream} - A Gulp plugin that can be used to minify HTML files.
 *
 * @example
 * import GulpHtmlSqueezer from "@zilero/gulp-html-squeezer";
 *
 * gulp.src("src/*.html")
 *   .pipe(GulpHtmlSqueezer())
 *   .pipe(gulp.dest("dist"));
 */
const GulpHtmlSqueezer = ({
	logStream = false,
	logEnd = false,
	skipFilesWithoutExtension = true,
	onBeforeMinify,
	onAfterMinify,
	...minifyOptions
}: GulpHtmlSqueezerOptions) => {
	// Checking the validity of the function onBeforeMinify.
	if (onBeforeMinify && !isFunction(onBeforeMinify)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'OnBeforeMinify must be a function.',
		});
	}

	// Checking the validity of the function onAfterMinify.
	if (onAfterMinify && !isFunction(onAfterMinify)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'OnAfterMinify must be a function.',
		});
	}

	let fileCount = 0; // Counter of processed files.
	let processedCount = 0; // Counter of processed files.
	let errorCount = 0; // Error Counter.

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				const isBuffer = file.isBuffer();

				// Skipping files without an extension .html (if enabled).
				if (skipFilesWithoutExtension && !file.extname.endsWith('.html')) {
					if (logStream) {
						GulpWinstonLogger({
							pluginName: PLUGIN_NAME,
							message: `Skipped file: ${file.relative} because it does not have an extension .html.`,
							options: {
								level: 'warn',
							},
						});
					}

					return file;
				}

				if (isBuffer) {
					// Get the content of the file.
					let content = file.contents.toString();

					// onBeforeMinify call (if passed).
					const onBeforeModified = onBeforeMinify ? await onBeforeMinify(content) : content;

					// Update the content of the file.
					if (onBeforeModified && isString(onBeforeModified)) {
						content = onBeforeModified;
					}

					// Minify the HTML content.
					content = await minify(content, minifyOptions);

					// onAfterMinify call (if passed).
					const onAfterModified = onAfterMinify ? await onAfterMinify(content) : content;

					// Update the content of the file.
					if (onAfterModified && isString(onAfterModified)) {
						content = onAfterModified;
					}

					// Increasing the counter of processed files.
					processedCount++;

					// Update the contents of the file.
					file.contents = Buffer.from(content);
				} else {
					// Increasing the count of missed files.
					errorCount++;
				}

				if (logStream) {
					GulpWinstonLogger({
						pluginName: PLUGIN_NAME,
						message: `Minified HTML file ${file.relative} ${isBuffer ? 'successfully.' : 'failed.'}.`,
						options: {
							level: 'info',
						},
					});
				}

				// Increasing the counter of processed files.
				fileCount++;

				return file;
			} catch (error: unknown) {
				return handleUnknownError({
					pluginName: PLUGIN_NAME,
					message: `An error occurred while processing file ${file.relative}.`,
					error,
				});
			}
		},
		onFinish: () => {
			if (logEnd) {
				GulpWinstonLogger({
					pluginName: PLUGIN_NAME,
					message: `Total files: ${fileCount}, Total processed files: ${processedCount}, Total errors: ${errorCount} HTML file(s).`,
					options: {
						level: 'info',
					},
				});
			}
		},
	});
};

export default GulpHtmlSqueezer;
