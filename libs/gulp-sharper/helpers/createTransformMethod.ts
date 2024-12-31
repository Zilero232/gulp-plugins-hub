import { InvalidFormatError } from '@shared/utils';
import { isBoolean, isObject } from '@shared/helpers/typeHelpers';

import type { GulpSharperOptions, InitialSharp, SupportedTransformMethod } from '../types';

interface CreateTransformProps<T extends SupportedTransformMethod> {
	pipeline: InitialSharp;
	options: GulpSharperOptions[T];
	method: string;
	expectedType: 'number' | 'object' | 'boolean';
}

/**
 * Dynamically calls a method on the sharp pipeline, given options and the method name.
 *
 * If the options are not of the expected type, it throws an InvalidFormatError.
 *
 * @returns {InitialSharp} - The modified sharp pipeline.
 */
const createTransformMethod = <T extends SupportedTransformMethod>({
	pipeline,
	options,
	method,
	expectedType,
}: CreateTransformProps<T>): InitialSharp => {
	const isValid = expectedType === 'object' ? isObject(options) : isBoolean(options);

	if (!isValid) {
		throw new InvalidFormatError({
			fieldName: `CreateTransformMethod: ${method}`,
			receivedValue: options,
			expectedType,
		});
	}

	// Dynamically calling the method on the pipeline.
	return (pipeline[method as keyof InitialSharp] as (opts: GulpSharperOptions[T]) => InitialSharp)(options);
};

export default createTransformMethod;
