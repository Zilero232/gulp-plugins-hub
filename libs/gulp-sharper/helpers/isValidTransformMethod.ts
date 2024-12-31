import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { SupportedTransformMethod } from '../types';

import { PLUGIN_NAME } from '../constants';

/**
 * Checks if the given key is a valid transform method.
 *
 * @param key - The key to check.
 *
 * @returns true if the key is a valid transform method, false otherwise.
 */
const isValidTransformMethod = (key: string): boolean => {
	const keys = Object.values(SupportedTransformMethod) as string[];

	if (!keys.includes(key)) {
		GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: `${key} is not a valid transform method. It will be ignored.`,
			options: {
				level: 'warn',
			},
		});
	}

	return keys.includes(key);
};

export default isValidTransformMethod;
