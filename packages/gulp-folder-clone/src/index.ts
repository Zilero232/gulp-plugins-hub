import { type FileVinyl } from '@/shared/schemas';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { gulpFolderCloneSchema, type GulpFolderCloneOptions } from './schema';

import defaultOptions from './config/PluginOptionsDefault';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpFolderCloneSchema,
  defaults: defaultOptions,
});

/**
 * Creates a Gulp plugin that can be used to clone a folder.
 *
 * @example
 * import GulpFolderClone from '@zilero/gulp-folder-clone';
 *
 * // Clone single files
 * gulp.src("src/images/*.png")
 *   .pipe(GulpFolderClone())
 *   .pipe(gulp.dest("dist/images"));
 */
const GulpFolderClone = (options: GulpFolderCloneOptions = {}) => {
  const { logFinish } = validateOptions(options);

	let fileCount = 0; // Counter of processed files.
	let errorCount = 0; // Error Counter.

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
        // Apply transformations if needed
        const modifiedFile = options.onBeforeCopy ? await options.onBeforeCopy(file) : file;

        if (modifiedFile) {
          file = modifiedFile;
        }

        // Increment the file count.
        fileCount++;

        return file;
			} catch (error: unknown) {
				console.error('An error occurred during file cloning', error);
			}
		},
		onFinish: async () => {
			try {
				if (logFinish) {
          console.log(`Total files cloned: ${fileCount}, Total errors: ${errorCount} file(s).`);
				}
			} catch (error: unknown) {
				console.error('An error occurred during the finalization of the plugin.', error);
			}
		},
	});
};

export default GulpFolderClone;
