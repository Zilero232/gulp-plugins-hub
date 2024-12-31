import fs from 'node:fs/promises';

import { InvalidFormatError } from '@shared/utils';
import { isNumber, isString } from '@shared/helpers/typeHelpers';

interface CompareLastModifiedTimeProps {
	sourceMtimeMs: number;
	targetPath: string;
}

/**
 * Compares the last modified time of the source file with the target file.
 *
 * @param {CompareLastModifiedTimeProps} props - Contains the comparison details.
 * @param {number} props.sourceMtimeMs - Last modified time of the source in milliseconds.
 * @param {string} props.targetPath - Path to the target file for comparison.
 *
 * @returns {Promise<boolean>} - Resolves to true if the source's last modified time is greater than the target's, otherwise false.
 *
 * @throws {InvalidFormatError} - If the sourceMtimeMs is not a number or the targetPath is not a string.
 */
const compareLastModifiedTime = async ({ sourceMtimeMs, targetPath }: CompareLastModifiedTimeProps): Promise<boolean> => {
	if (!sourceMtimeMs || !isNumber(sourceMtimeMs)) {
		throw new InvalidFormatError({
			fieldName: 'compareLastModifiedTime',
			receivedValue: sourceMtimeMs,
			expectedType: 'string',
		});
	}

	if (!targetPath || !isString(targetPath)) {
		throw new InvalidFormatError({
			fieldName: 'compareLastModifiedTime',
			receivedValue: targetPath,
			expectedType: 'string',
		});
	}

	const targetStat = await fs.stat(targetPath);

	return Math.floor(sourceMtimeMs) > Math.ceil(targetStat.mtimeMs);
};

export default compareLastModifiedTime;
