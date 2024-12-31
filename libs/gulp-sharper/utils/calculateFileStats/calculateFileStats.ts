import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { InvalidFormatError } from '@shared/utils';
import { isNumber, isString } from '@shared/helpers/typeHelpers';

import { calculateReductionPercentage, convertBytesToKB } from '../../helpers/calculateHelpers';

import { PLUGIN_NAME } from '../../constants';

interface CalculateFileStatsProps {
	filePath: string;
	originalSize: number;
	compressedSize: number;
}

/**
 * Calculates statistics for an individual image.
 *
 * @param filePath - The path to the image.
 * @param originalSize - The original size of the image in bytes.
 * @param compressedSize - The size of the image after compression in bytes.
 */
export const calculateFileStats = ({ filePath, originalSize, compressedSize }: CalculateFileStatsProps): void => {
	if (!filePath || !isString(filePath)) {
		throw new InvalidFormatError({
			fieldName: 'CalculateFileStats: filePath',
			receivedValue: filePath,
			expectedType: 'string',
		});
	}

	if (!originalSize || !isNumber(originalSize)) {
		throw new InvalidFormatError({
			fieldName: 'CalculateFileStats: originalSize',
			receivedValue: originalSize,
			expectedType: 'number',
		});
	}

	if (!compressedSize || !isNumber(compressedSize)) {
		throw new InvalidFormatError({
			fieldName: 'CalculateFileStats: compressedSize',
			receivedValue: compressedSize,
			expectedType: 'number',
		});
	}

	const originalSizeInKB = convertBytesToKB(originalSize);
	const compressedSizeInKB = convertBytesToKB(compressedSize);
	const sizeReduction = calculateReductionPercentage(originalSize, compressedSize);

	const message = `Processed image: ${filePath}
  - Original size: ${originalSizeInKB} KB,
  Compressed size: ${compressedSizeInKB} KB,
  Reduction: ${sizeReduction} %`;

	// Logging information for each file.
	GulpWinstonLogger({
		pluginName: PLUGIN_NAME,
		message,
		options: {
			level: 'info',
		},
	});
};
