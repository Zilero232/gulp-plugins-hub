import path from 'node:path';
import archiver from 'archiver';
import concat from 'concat-stream';
import Vinyl from 'vinyl';

import type { Transform as TransformStream } from 'node:stream';

import { handleUnknownError, InvalidFormatError } from '@shared/utils';
import { isObject } from '@shared/helpers/typeHelpers';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import defaultOptions from './config/PluginOptionsDefault';

import type { GulpArchiveCreatorOptions } from './types';
import { FormatZipOptions } from './types';

import { PLUGIN_NAME } from './constants';

/**
 * A Gulp plugin that can be used to create archives of files in a stream.
 *
 * The plugin will create an archive with the specified format and add all files
 * in the stream to it, while logging progress if enabled. On completion, it will
 * log the result, including the number of files processed and the final size of
 * the archive.
 *
 * @param options - Options for the plugin, including the format, output path, archive name, and whether to log progress.
 *
 * @returns A Gulp plugin that can be used to create archives of files in a stream.
 */
const GulpArchiveCreator = (options: GulpArchiveCreatorOptions = defaultOptions) => {
	if (!isObject(options)) {
		throw new InvalidFormatError({
			fieldName: PLUGIN_NAME,
			receivedValue: options,
			expectedType: 'object',
		});
	}

	if (!options.format.includes(FormatZipOptions.Zip) && !options.format.includes(FormatZipOptions.Tar)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'Unsupported format.',
		});
	}

	const mergedOptions = { ...defaultOptions, ...options };

	// Create an archive stream using the chosen format.
	const archive = archiver(mergedOptions.format, mergedOptions);

	// File Counter.
	let fileCount = 0;

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				// Checking if the file needs to be excluded.
				if (options.excludeFiles?.includes(file.relative)) {
					return file; // Skip the file.
				}

				if (file.isBuffer()) {
					// Adding the file to the archive.
					archive.append(file.contents, { name: file.relative });

					// Increasing the file counter.
					fileCount += 1;

					// Log progress if enabled.
					if (mergedOptions.logProgress) {
						GulpWinstonLogger({
							pluginName: PLUGIN_NAME,
							message: `Added ${file.relative} to the archive.`,
							options: {
								level: 'info',
							},
						});
					}
				}

				return file;
			} catch (error: unknown) {
				return handleUnknownError({
					pluginName: PLUGIN_NAME,
					message: 'An error occurred while adding file to the archive.',
					error,
				});
			}
		},
		onFinish: async (stream: TransformStream) => {
			try {
				const isArchive = fileCount > 0;

				if (!isArchive && !mergedOptions.createEmptyArchive) {
					GulpWinstonLogger({
						pluginName: PLUGIN_NAME,
						message: 'No files were added to the archive. The archive was not created.',
						options: { level: 'warn' },
					});
				}

				// Closing the archive if there were files to archive.
				await archive.finalize();

				// Create a new vinyl file with the archived data.
				concat((buffer) => {
					const outputFile = new Vinyl({
						cwd: './',
						base: options.outputPath,
						path: path.join(options.outputPath, options.archiveName),
						contents: buffer, // Используем полученный буфер
					});

					// Push the created archive file to the stream.
					stream.push(outputFile);
				});

				// Log the result.
				if (options.logFinal) {
					GulpWinstonLogger({
						pluginName: PLUGIN_NAME,
						message: isArchive
							? `Successfully processed ${fileCount} files into ${mergedOptions.archiveName}`
							: `Created an empty archive at ${mergedOptions.archiveName}`,
						options: {
							level: isArchive ? 'info' : 'warn',
						},
					});
				}
			} catch (error: unknown) {
				handleUnknownError({
					pluginName: PLUGIN_NAME,
					message: 'An error occurred while finalizing the archive.',
					error,
				});
			}
		},
	});
};

export default GulpArchiveCreator;
