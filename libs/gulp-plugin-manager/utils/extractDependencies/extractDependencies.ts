import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { InvalidFormatError } from '@shared/utils';
import { isArray, isObject } from '@shared/helpers/typeHelpers';

import { matchPattern } from '..';

import type { GulpPluginManagerOptions, ScopeDependencyValues } from '../../types';
import { ScopeDependencyTypes } from '../../types';

import { PLUGIN_NAME } from '../../constants';

interface ExtractDependenciesProps extends Pick<GulpPluginManagerOptions, 'patternOptions' | 'scopes'> {
	packageJsonObject: ScopeDependencyValues;
}

/**
 * Extracts the dependencies from the package.json file and returns an object with the dependencies matching the given patterns.
 *
 * @param {ExtractDependenciesProps} props - The properties to configure the  dependency extraction.
 * @param {ScopeDependencyValues} props.packageJsonObject - The package.json object.
 * @param {string[]} [props.scopes] - The dependency scopes to extract.
 * @param {PatternOptions} [props.patternOptions] - Options for matching  patterns.
 *
 * @returns {Record<string, string>} An object with the extracted dependencies.
 *
 * @throws {InvalidFormatError} If the packageJsonObject is not an object.
 * @throws {InvalidFormatError} If the scopes is not an array.
 * @throws {InvalidFormatError} If the patterns is not an array.
 */
export const extractDependencies = ({ packageJsonObject, scopes = [], patternOptions = {} }: ExtractDependenciesProps) => {
	const dependencies: Record<string, string> = {};

	if (!packageJsonObject || !isObject(packageJsonObject)) {
		throw new InvalidFormatError({
			fieldName: 'ExtractDependencies: packageJsonObject',
			receivedValue: packageJsonObject,
			expectedType: 'array',
		});
	}

	if (!scopes || !isArray(scopes)) {
		throw new InvalidFormatError({
			fieldName: 'ExtractDependencies: scopes',
			receivedValue: scopes,
			expectedType: 'array',
		});
	}

	if (!patternOptions && !isArray(patternOptions)) {
		throw new InvalidFormatError({
			fieldName: 'ExtractDependencies: patterns',
			receivedValue: patternOptions,
			expectedType: 'array',
		});
	}

	scopes.forEach((scope) => {
		const dependencyTypesValues = Object.values(ScopeDependencyTypes);

		if (!packageJsonObject[scope]) {
			GulpWinstonLogger({
				pluginName: PLUGIN_NAME,
				message: `Current scope '${scope}' not available in package.json. Available scopes: ${dependencyTypesValues}`,
			});
		}

		let count = 0;

		Object.keys(packageJsonObject[scope]).forEach((key) => {
			// // Limit on the number of results if maxResults is specified.
			if (patternOptions.maxResults && count >= patternOptions.maxResults) {
				return;
			}

			// Checking the key for matching patterns (string or regular expression).
			if (matchPattern({ key, patternOptions })) {
				dependencies[key] = packageJsonObject[scope][key];

				// Increase the counter by 1 if a match is found.
				count++;
			}
		});
	});

	return dependencies;
};
