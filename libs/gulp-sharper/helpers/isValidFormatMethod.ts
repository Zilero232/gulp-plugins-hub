import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { SupportedFormatMethod } from '../types';

import { PLUGIN_NAME } from '../constants';

/**
 * Checks if the given key is a valid format options.
 *
 * @param key - The key to check.
 *
 * @returns true if the key is a valid format options, false otherwise.
 */
const isValidFormatMethod = (key: string): boolean => {
	const keys = Object.values(SupportedFormatMethod) as string[];

	if (!keys.includes(key)) {
		GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: `${key} is not a valid format options. It will be ignored.`,
			options: {
				level: 'warn',
			},
		});
	}

	return keys.includes(key);
};

export default isValidFormatMethod;
