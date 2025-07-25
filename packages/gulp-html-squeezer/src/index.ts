import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import { minify } from 'html-minifier-terser';

import type { GulpHtmlSqueezerOptions } from './types';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

/**
 * A Gulp plugin that can be used to minify HTML files.
 *
 * @example
 * import GulpHtmlSqueezer from "@zilero/gulp-html-squeezer";
 *
 * gulp.src("src/*.html")
 *   .pipe(GulpHtmlSqueezer())
 *   .pipe(gulp.dest("dist"));
 */
const GulpHtmlSqueezer = (options: GulpHtmlSqueezerOptions) => {
  const { htmlMinifierOptions = {}, pluginOptions = {} } = { ...defaultOptions, ...options };

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

					// Minify the HTML content.
					content = await minify(content, htmlMinifierOptions);

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
					console.log(`Minified HTML file ${file.relative} successfully.`);
				}

				return file;
			} catch (error: unknown) {
				throw new Error(`An error occurred while processing file ${file.relative}.`, { cause: error });
			}
		},
		onFinish: async () => {
      try {
        // Log the final result.
        if (pluginOptions.logFinal) {
          console.log(`Total files processed: ${fileCount}, Total errors: ${errorCount} HTML file(s).`);
        }
      } catch (error: unknown) {
        throw new Error(`An error occurred while logging the final result.`, { cause: error });
      }
		},
	});
};

export default GulpHtmlSqueezer;
