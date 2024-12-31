import {
	fileContainsContent,
	filePathContains,
	getFileCreationDate,
	getFileExtension,
	getFileModificationDate,
	getFileName,
	getFileSize,
} from '../../helpers';

import type { ConditionOptions } from '../../types';

interface ValidateConditionProps {
	file: FileVinyl;
	condition: ConditionOptions;
}

export const validateCondition = ({ file, condition }: ValidateConditionProps): boolean => {
	// Check if the file's extension matches the specified conditions
	if (condition.extensions) {
		const extensions = Array.isArray(condition.extensions) ? condition.extensions : [condition.extensions];

		if (!extensions.includes(getFileExtension(file))) {
			return false;
		}
	}

	// Check if the file's name contains the specified substrings
	if (condition.namesContains) {
		const nameContains = Array.isArray(condition.namesContains) ? condition.namesContains : [condition.namesContains];

		if (!nameContains.some((part) => getFileName(file).includes(part))) {
			return false;
		}
	}

	// Check if the file's name matches the specified values
	if (condition.namesEquals) {
		const nameEquals = Array.isArray(condition.namesEquals) ? condition.namesEquals : [condition.namesEquals];

		if (!nameEquals.includes(getFileName(file))) {
			return false;
		}
	}

	// Check if the file size meets the minimum size condition
	if (condition.minSize && getFileSize(file) < condition.minSize) {
		return false;
	}

	// Check if the file size meets the maximum size condition
	if (condition.maxSize && getFileSize(file) > condition.maxSize) {
		return false;
	}

	// Check if the file's modification date is after the specified date
	if (condition.modifiedAfter && getFileModificationDate(file).getTime() < new Date(condition.modifiedAfter).getTime()) {
		return false;
	}

	// Check if the file's modification date is before the specified date
	if (condition.modifiedBefore && getFileModificationDate(file).getTime() > new Date(condition.modifiedBefore).getTime()) {
		return false;
	}

	// Check if the file's creation date is after the specified date
	if (condition.createdAfter && getFileCreationDate(file).getTime() < new Date(condition.createdAfter).getTime()) {
		return false;
	}

	// Check if the file's creation date is before the specified date
	if (condition.createdBefore && getFileCreationDate(file).getTime() > new Date(condition.createdBefore).getTime()) {
		return false;
	}

	// Check if the file contains the specified content
	if (condition.containsContent) {
		if (!fileContainsContent(file, condition.containsContent)) {
			return false;
		}
	}

	// Check if the file's path contains the specified substrings
	if (condition.pathContains) {
		if (!filePathContains(file, condition.pathContains)) {
			return false;
		}
	}

	// Check if the file has the specified number of lines
	if (condition.lineCount) {
		const lineCount = file.contents?.toString('utf8').split('\n').length;

		if (lineCount !== condition.lineCount) {
			return false;
		}
	}

	// Check if the file size in kilobytes matches the specified size
	if (condition.sizeInKB && getFileSize(file) / 1024 !== condition.sizeInKB) {
		return false;
	}

	// Check if the file passes the custom filter
	if (condition.customFileFilter && !condition.customFileFilter(file)) {
		return false;
	}

	return true;
};
