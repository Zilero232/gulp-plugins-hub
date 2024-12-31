import { InvalidFormatError } from '@shared/utils';
import { isNumber } from '@shared/helpers/typeHelpers';

/**
 * Converts bytes to kilobytes and formats the result to two decimal places.
 *
 * @param sizeInBytes - The size in bytes.
 *
 * @returns {string} - The size in kilobytes formatted to two decimal places.
 * @throws {Error} - Throws an error if the input is not a number.
 */
export const convertBytesToKB = (sizeInBytes: number): string => {
	if (!isNumber(sizeInBytes)) {
		throw new InvalidFormatError({
			fieldName: 'СonvertBytesToKB: sizeInBytes',
			receivedValue: sizeInBytes,
			expectedType: 'number',
		});
	}

	return (sizeInBytes / 1024).toFixed(2);
};

/**
 * Calculates the percentage reduction in size.
 *
 * @param originalSize - The original size in bytes.
 * @param compressedSize - The compressed size in bytes.
 *
 * @returns {string} - The percentage reduction in size, formatted to two decimal places.
 * @throws {Error} - Throws an error if the input is not a number.
 */
export const calculateReductionPercentage = (originalSize: number, compressedSize: number): string => {
	if (!isNumber(originalSize)) {
		throw new InvalidFormatError({
			fieldName: 'СalculateReductionPercentage: originalSize',
			receivedValue: originalSize,
			expectedType: 'number',
		});
	}

	if (!isNumber(originalSize)) {
		throw new InvalidFormatError({
			fieldName: 'СalculateReductionPercentage: compressedSize',
			receivedValue: compressedSize,
			expectedType: 'number',
		});
	}

	return ((1 - compressedSize / originalSize) * 100).toFixed(2);
};
