import path from 'node:path';

import { InvalidFormatError } from '@shared/utils';
import { isString } from '@shared/helpers/typeHelpers';

interface GetTargetPathProps {
	pathRelative: string;
	destination: string;
}

/**
 * Returns the full path of a file relative to a given destination directory.
 *
 * @param {GetTargetPathProps} props - Options for getting the target path.
 * @param {string} props.pathRelative - The relative path of the file.
 * @param {string} props.destination - The destination directory.
 *
 * @returns {string} - The full path of the file relative to the destination directory.
 *
 * @throws {InvalidFormatError} - If the pathRelative or destination is not a string.
 */
const getTargetPath = ({ pathRelative, destination }: GetTargetPathProps): string => {
	if (!pathRelative || !isString(pathRelative)) {
		throw new InvalidFormatError({
			fieldName: 'getTargetPath',
			receivedValue: pathRelative,
			expectedType: 'string',
		});
	}

	if (!pathRelative || !isString(pathRelative)) {
		throw new InvalidFormatError({
			fieldName: 'getTargetPath',
			receivedValue: destination,
			expectedType: 'string',
		});
	}

	return path.resolve(destination, pathRelative); // Get the relative path.
};

export default getTargetPath;
