import { InvalidFormatError } from '@shared/utils';
import { isBoolean, isString } from '@shared/helpers/typeHelpers';

import type { TimestampFormat } from '../../types';

const formatMapping: Record<TimestampFormat, string> = {
	FULL_DATE: 'YYYY-MM-DD HH:mm:ss',
	DATE_ONLY: 'YYYY-MM-DD',
	TIME_ONLY: 'HH:mm:ss',
	SHORT: 'DD/MM/YYYY HH:mm',
	ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
	UNIX: 'X',
};

interface GetTimestampFormat {
	timestampOption: TimestampFormat | string;
}

/**
 * Given a timestampOption, returns the corresponding date format string.
 * If the option is a boolean, it will return the FULL_DATE format.
 * If the option is a string, it will return the corresponding date format string
 * from the formatMapping object, or the string itself if it is not found in the object.
 * If the option is neither a boolean nor a string, it will throw an InvalidFormatError.
 *
 * @returns string
 */
export const getTimestampFormat = ({ timestampOption }: GetTimestampFormat) => {
	if (isBoolean(timestampOption)) {
		return formatMapping.FULL_DATE;
	}

	if (isString(timestampOption)) {
		return formatMapping[timestampOption as TimestampFormat] || timestampOption;
	}

	throw new InvalidFormatError({
		fieldName: 'align',
		receivedValue: timestampOption,
		expectedType: 'boolean or TimestampFormat',
	});
};
