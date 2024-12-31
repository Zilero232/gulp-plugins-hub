import path from 'node:path';

import { InvalidFormatError } from '@shared/utils';
import { isString } from '@shared/helpers/typeHelpers';

interface CompareByNameProps {
	sourcePath: string;
	targetPath: string;
}

/**
 * Compares source and target paths by name.
 *
 * @param {CompareByNameProps} props - Comparison options.
 * @param {string} props.sourcePath - Source path to compare.
 * @param {string} props.targetPath - Target path to compare.
 *
 * @returns {boolean} - Whether the source and target paths have the same name.
 *
 * @throws {InvalidFormatError} - If the sourcePath or targetPath is not a string.
 */
function compareByName({ sourcePath, targetPath }: CompareByNameProps): boolean {
	if (!sourcePath || !isString(targetPath)) {
		throw new InvalidFormatError({
			fieldName: 'compareByName',
			receivedValue: sourcePath,
			expectedType: 'string',
		});
	}

	if (!targetPath || !isString(targetPath)) {
		throw new InvalidFormatError({
			fieldName: 'compareByName',
			receivedValue: targetPath,
			expectedType: 'string',
		});
	}

	return path.basename(sourcePath) === path.basename(targetPath);
}

export default compareByName;
