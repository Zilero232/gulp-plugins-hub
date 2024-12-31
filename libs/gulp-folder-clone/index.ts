import path from 'node:path';
import fs from 'node:fs';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { handleUnknownError } from '@shared/utils';
import { isFunction, isString } from '@shared/helpers/typeHelpers';

import { shouldExcludeFile } from './utils';

import { PLUGIN_NAME } from './constants';

import type { GulpFolderCloneOptions } from './types';

/**
 * Creates a Gulp plugin that can be used to clone a folder.
 *
 * The plugin will copy all files from the source folder to the destination folder,
 * while allowing the user to filter out certain files, skip overwriting files in
 * the destination folder, and modify the files before they are copied.
 *
 * It will also log the number of files processed, skipped, and excluded.
 *
 * @param {GulpFolderCloneOptions} options - Options for the plugin, including
 * the destination folder, whether to overwrite files, which files to exclude,
 * a filter function, and a function to modify the file before copying.
 *
 * @returns {TransformStream} A Gulp plugin stream that can be used to clone a folder.
 */
const GulpFolderClone = ({
	destFolder = 'dist',
	overwrite = true,
	excludeFiles = [],
	fileFilter = () => true,
	onBeforeCopy = (file: FileVinyl) => file,
	logFinish = true,
}: GulpFolderCloneOptions) => {
	if (!destFolder || !isString(destFolder)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'DestFolder is required and must be a string.',
		});
	}

	if (!fileFilter || !isFunction(fileFilter)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'FileFilter is required and must be a function.',
		});
	}

	if (!onBeforeCopy || !isFunction(onBeforeCopy)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'OnBeforeCopy is required and must be a function.',
		});
	}

	let processedFiles = 0;
	let skippedFiles = 0;
	let excludedFiles = 0;

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				const filePath = file.relative;

				// Skip the processing of the folder if it not exists or if overwrite is disabled.
				if (overwrite && fs.existsSync(destFolder)) {
					// Defining the path of the file in the target directory.
					const targetFilePath = path.join(destFolder, filePath);

					// Check the existence of the file.
					if (fs.existsSync(targetFilePath)) {
						GulpWinstonLogger({
							pluginName: PLUGIN_NAME,
							message: `File already exists and overwrite is disabled: ${targetFilePath}`,
							options: { level: 'warn' },
						});

						// Increasing the count of skipped files.
						skippedFiles++;

						return null;
					}
				}

				// Skip the file if it does not pass the custom filter.
				if (excludeFiles.length && shouldExcludeFile({ filePath, excludeFiles })) {
					GulpWinstonLogger({
						pluginName: PLUGIN_NAME,
						message: `Excluding file: ${filePath} from the cloning process.`,
						options: {
							level: 'info',
						},
					});

					// Increasing the count of excluded files.
					excludedFiles++;

					return null;
				}

				// If the file does not match the filter, skip it.
				if (!fileFilter(file)) {
					// Increasing the count of skipped files.
					skippedFiles++;

					return null;
				}

				// Modification of the file by the user before copying.
				const modifiedFile = await onBeforeCopy(file);

				if (!modifiedFile) {
					GulpWinstonLogger({
						pluginName: PLUGIN_NAME,
						message: `File processing skipped by OnBeforeCopy: ${filePath}`,
						options: {
							level: 'warn',
						},
					});

					// Increasing the count of skipped files.
					skippedFiles++;

					return null;
				}

				// Increasing the counter of processed files.
				processedFiles++;

				return file;
			} catch (error: unknown) {
				return handleUnknownError({
					pluginName: PLUGIN_NAME,
					message: 'An error occurred during file processing',
					error,
				});
			}
		},
		onFinish: () => {
			if (logFinish) {
				GulpWinstonLogger({
					pluginName: PLUGIN_NAME,
					message: `Processed files: ${processedFiles}, Skipped files (due to overwrite): ${skippedFiles}, Excluded files (by onBeforeCopy): ${excludedFiles}`,
					options: {
						level: 'info',
					},
				});
			}
		},
	});
};

export default GulpFolderClone;
