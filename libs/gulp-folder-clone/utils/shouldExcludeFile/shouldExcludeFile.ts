import { isString } from '@shared/helpers/typeHelpers';

import type { GulpFolderCloneOptions } from '../../types';

interface ShouldExcludeFile {
	filePath: string;
	excludeFiles: GulpFolderCloneOptions['excludeFiles'];
}

/**
 * Checks if a file should be excluded from the cloning process according to the `excludeFiles` array.
 *
 * If the `excludeFiles` array contains a string, the method will check if the
 * file path includes the string. If the array contains a regular expression,
 * the method will test the file path against the regular expression.
 *
 * @param {string} filePath - the path of the file to check
 * @param {Array<string | RegExp>} excludeFiles - the patterns to check against
 *
 * @returns {boolean} true if the file should be excluded, false otherwise
 */
export const shouldExcludeFile = ({ filePath, excludeFiles }: ShouldExcludeFile): boolean => {
	if (!filePath || !Array.isArray(excludeFiles)) {
		return false;
	}

	// Checking whether the file should be excluded by the `excludeFiles` array.
	return excludeFiles.some((pattern) => {
		// Checking if the pattern is a string.
		if (isString(pattern)) {
			return filePath.includes(pattern);
		}
		// Checking if the pattern is a regular expression.
		else if (pattern instanceof RegExp) {
			return pattern.test(filePath);
		}

		return false;
	});
};
