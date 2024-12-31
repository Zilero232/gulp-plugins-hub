import sharp from 'sharp';

import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { handleUnknownError, InvalidFormatError } from '@shared/utils';
import { isBoolean, isObject } from '@shared/helpers/typeHelpers';

import { calculateFileStats, calculateImageStats, createSharpFormats, createSharpTransformations } from './utils';

import type { GulpSharperOptions } from './types';

import { PLUGIN_NAME } from './constants';

/**
 * A Gulp plugin that can be used to process and transform images.
 *
 * The plugin processes images in the stream, applies transformations, and logs the results.
 * On completion, it provides statistics on the number of images processed and the size reduction.
 *
 * @returns A Gulp plugin that can be used to transform images.
 */
const GulpSharper = (
	options: GulpSharperOptions = {
		enableFileLogging: true,
		enableFinalLogging: true,
	},
) => {
	if (!options && !isObject(options)) {
		throw new InvalidFormatError({
			fieldName: 'GulpSharper',
			receivedValue: options,
			expectedType: 'GulpSharperOptions',
		});
	}

	// Variables for tracking statistics across all images in the stream.
	let totalImagesProcessed = 0;
	let totalOriginalSize = 0;
	let totalCompressedSize = 0;

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			try {
				if (!file.isBuffer()) {
					throw new Error(`File contents are not a valid Buffer in ${file.path}`);
				}

				const originalSize = file.contents.length; // Store the original size of the file in bytes.
				totalOriginalSize += originalSize; // Add to total original size across all files.

				let pipeline = sharp(file.contents, options);

				// Applying different formats for the image.
				pipeline = createSharpFormats({ pipeline, formats: options.formats });

				// Applying various transformations to the image.
				pipeline = createSharpTransformations({ pipeline, transformations: options });

				// Receive the processed data as a Buffer.
				const processedBuffer = await pipeline.toBuffer();

				// Updating the contents of the file.
				file.contents = processedBuffer;

				const compressedSize = processedBuffer.length; // Store the compressed size of the file in bytes.
				totalCompressedSize += compressedSize; // Add to total compressed size across all files.
				totalImagesProcessed++; // Increment the processed images counter.

				// Calculate and log statistics for the current file.
				if (isBoolean(options.enableFileLogging) && options.enableFileLogging) {
					calculateFileStats({ filePath: file.path, originalSize, compressedSize });
				}

				// Returning the updated file.
				return file;
			} catch (error: unknown) {
				return handleUnknownError({
					pluginName: PLUGIN_NAME,
					message: 'Error processing image.',
					error,
				});
			}
		},
		onFinish: () => {
			if (totalImagesProcessed > 0) {
				// Calculate overall and log statistics for all processed images.
				if (isBoolean(options.enableFinalLogging) && options.enableFinalLogging) {
					calculateImageStats({ totalImagesProcessed, totalOriginalSize, totalCompressedSize });
				}
			} else {
				GulpWinstonLogger({
					pluginName: PLUGIN_NAME,
					message: 'No images were processed.',
					options: {
						level: 'warn',
					},
				});
			}
		},
	});
};

export default GulpSharper;
