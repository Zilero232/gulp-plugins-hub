import { isBoolean, isObject } from '@shared/helpers/typeHelpers';

import { createWinstonFormat } from '../utils';

interface TransportOptions {
	format?: unknown;
}

interface CreateTransportConfigProps<T> {
	pluginName: string;
	options: boolean | T;
	defaultOptions: T;
}

/**
 * Creates a winston transport configuration, given a boolean or transport options.
 * If boolean, it will return the default options. If transport options, it will
 * merge the options with the default options and return the result.
 */
const createTransportConfig = <T extends TransportOptions>({ pluginName, options, defaultOptions }: CreateTransportConfigProps<T>): T => {
	return isBoolean(options)
		? defaultOptions
		: ({
				...defaultOptions,
				...options,
				format: createWinstonFormat({
					pluginName,
					options: {
						...(isObject(defaultOptions.format) ? defaultOptions.format : {}),
						...(isObject(options.format) ? options.format : {}),
					},
				}),
			} as T);
};

export default createTransportConfig;
