import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { InvalidFormatError } from '@shared/utils';
import { isNumber } from '@shared/helpers/typeHelpers';

import { calculateReductionPercentage, convertBytesToKB } from '../../helpers/calculateHelpers';

import { PLUGIN_NAME } from '../../constants';

interface CalculateImageStatsProps {
	totalImagesProcessed: number;
	totalOriginalSize: number;
	totalCompressedSize: number;
}

/**
 * Calculates the overall statistics for the processed image.
 *
 * @param totalImagesProcessed - The total number of processed images.
 * @param totalOriginalSize - The total original size of all images in bytes.
 * @param totalCompressedSize - The total compressed size of all images in bytes.
 */
export const calculateImageStats = ({ totalImagesProcessed, totalOriginalSize, totalCompressedSize }: CalculateImageStatsProps): void => {
	if (!totalImagesProcessed || !isNumber(totalImagesProcessed)) {
		throw new InvalidFormatError({
			fieldName: 'CalculateImageStats: totalImagesProcessed',
			receivedValue: totalImagesProcessed,
			expectedType: 'number',
		});
	}

	if (!totalOriginalSize || !isNumber(totalOriginalSize)) {
		throw new InvalidFormatError({
			fieldName: 'CalculateImageStats: totalOriginalSize',
			receivedValue: totalOriginalSize,
			expectedType: 'number',
		});
	}

	if (!totalCompressedSize || !isNumber(totalCompressedSize)) {
		throw new InvalidFormatError({
			fieldName: 'CalculateImageStats: totalCompressedSize',
			receivedValue: totalCompressedSize,
			expectedType: 'number',
		});
	}

	const originalSizeInKB = convertBytesToKB(totalOriginalSize);
	const compressedSizeInKB = convertBytesToKB(totalCompressedSize);
	const reductionPercentage = calculateReductionPercentage(totalOriginalSize, totalCompressedSize);

	const message = `Total images processed: ${totalImagesProcessed},
  Total original size: ${originalSizeInKB} KB,
  Total compressed size: ${compressedSizeInKB} KB,
  SizeReduction: ${reductionPercentage}%`;

	// Logging information for total files.
	GulpWinstonLogger({
		pluginName: PLUGIN_NAME,
		message,
		options: {
			level: 'info',
		},
	});
};
