import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { isBoolean, isRegExp, isString } from '@shared/helpers/typeHelpers';

import type { PatternOptions } from '../types';

import { PLUGIN_NAME } from '../constants';

interface KeyMatchesPatternProps {
	key: string;
	pattern: string | RegExp;
	options?: Pick<PatternOptions, 'allowPartialMatchString' | 'useFullMatchRegex'>;
}

/**
 * Checks if a given key matches a specified pattern, using optional matching rules.
 *
 * This function supports both string and regular expression patterns. For string patterns,
 * it can perform either a full match or a partial match based on the `allowPartialMatchString` option.
 * For regular expression patterns, it can perform either a full match or a partial match based on the
 * `useFullMatchRegex` option.
 *
 * If the pattern is neither a string nor a regular expression, a warning is logged using GulpWinstonLogger.
 *
 * @param {KeyMatchesPatternProps} props - The properties for matching the key against the pattern.
 * @param {string} props.key - The key to be matched.
 * @param {string | RegExp} props.pattern - The pattern to match the key against.
 * @param {object} [props.options] - The optional matching rules.
 * @param {boolean} [props.options.allowPartialMatchString] - Whether to allow partial matches for strings.
 * @param {boolean} [props.options.useFullMatchRegex] - Whether to use full matches for regular expressions.
 *
 * @returns {boolean} - Returns true if the key matches the pattern, otherwise false.
 */
const keyMatchesPattern = ({ key, pattern, options = {} }: KeyMatchesPatternProps): boolean => {
	const { allowPartialMatchString = false, useFullMatchRegex = false } = options;

	if (isString(pattern)) {
		// Partial match for strings.
		if (allowPartialMatchString && isBoolean(allowPartialMatchString)) {
			return key.includes(pattern);
		}

		return key === pattern;
	}

	if (isRegExp(pattern)) {
		// Full match for regular expressions.
		if (useFullMatchRegex && isBoolean(useFullMatchRegex)) {
			return new RegExp(`^${pattern.source}$`).test(key);
		}

		return pattern.test(key);
	}

	GulpWinstonLogger({
		pluginName: PLUGIN_NAME,
		message: `Pattern is not a valid string or RegExp: ${pattern}. It will be ignored.`,
		options: {
			level: 'warn',
		},
	});

	return false;
};

export default keyMatchesPattern;
