import { InvalidFormatError } from '@shared/utils';
import { isObject } from '@shared/helpers/typeHelpers';

import type { FormatOptions, InitialSharp, SupportedFormatMethod } from '../types';

interface CreateFormatMethod<T extends SupportedFormatMethod> {
	pipeline: InitialSharp;
	options: FormatOptions[T];
	method: T;
}

/**
 * Applies a format to the sharp pipeline.
 *
 * This function takes a pipeline, a format name and its options, and applies the
 * format to the pipeline. If the options are not an object, it throws an
 * InvalidFormatError.
 *
 * @returns {InitialSharp} - The modified sharp pipeline.
 */
const createFormatMethod = <T extends SupportedFormatMethod>({ pipeline, options, method }: CreateFormatMethod<T>): InitialSharp => {
	if (!isObject(options)) {
		throw new InvalidFormatError({
			fieldName: `CreateSharpMethod: ${method}`,
			receivedValue: options,
			expectedType: 'object',
		});
	}

	// Dynamically calling the method on the pipeline.
	return (pipeline[method] as (opts: FormatOptions[T]) => InitialSharp)(options);
};

export default createFormatMethod;
