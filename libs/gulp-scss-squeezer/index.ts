import dartSass from 'sass';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { handleUnknownError } from '@shared/utils';
import { isFunction, isString } from '@shared/helpers/typeHelpers';

import applyPostCSS from './utils/applyPostCSS/applyPostCSS';

import { PLUGIN_NAME } from './constants';

import type { GulpScssSqueezerOptions } from './types';

const GulpScssSqueezer = ({
	logStream = false,
	logEnd = false,
	skipFilesWithoutExtension = true,
	postCssPlugins = {},
	onBeforeCompile,
	onAfterCompile,
	...compilerOptions
}: GulpScssSqueezerOptions) => {
	// Checking the validity of the function onBeforeCompile.
	if (onBeforeCompile && !isFunction(onBeforeCompile)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'onBeforeCompile must be a function.',
		});
	}

	// Checking the validity of the function onAfterCompile.
	if (onAfterCompile && !isFunction(onAfterCompile)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'onAfterCompile must be a function.',
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

				// Skipping files without an extension .pug (if enabled).
				if (skipFilesWithoutExtension && !file.extname.endsWith('.scss')) {
					if (logStream) {
						GulpWinstonLogger({
							pluginName: PLUGIN_NAME,
							message: `Skipped file: ${file.relative} because it does not have an extension .scss`,
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
					const onBeforeCompiled = onBeforeCompile ? await onBeforeCompile(content) : content;

					// Update the content of the file.
					if (onBeforeCompiled && isString(onBeforeCompiled)) {
						content = onBeforeCompiled;
					}

					// Compiling SCSS to CSS.
					content = dartSass.compileString(content, compilerOptions).css;

					// Processing using Post CSS (if at least one plugin is enabled).
					if (postCssPlugins) {
						const cssContent = await applyPostCSS({
							content,
							options: postCssPlugins,
						});

						if (cssContent && isString(cssContent)) {
							content = cssContent;
						}
					}

					// onAfterMinify call (if passed).
					const onAfterCompiled = onAfterCompile ? await onAfterCompile(content) : content;

					// Update the content of the file.
					if (onAfterCompiled && isString(onAfterCompiled)) {
						content = onAfterCompiled;
					}

					// Increasing the counter of processed files.
					processedCount++;

					// Update the contents of the file.
					file.contents = Buffer.from(content);

					// Update the extension of the file on .css.
					file.extname = '.css';
				} else {
					// Increasing the count of missed files.
					errorCount++;
				}

				if (logStream) {
					GulpWinstonLogger({
						pluginName: PLUGIN_NAME,
						message: `Minified PUG file ${file.relative} ${isBuffer ? 'successfully.' : 'failed.'}.`,
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
					message: `Total files: ${fileCount}, Total processed files: ${processedCount}, Total errors: ${errorCount} PUG file(s).`,
					options: {
						level: 'info',
					},
				});
			}
		},
	});
};

export default GulpScssSqueezer;