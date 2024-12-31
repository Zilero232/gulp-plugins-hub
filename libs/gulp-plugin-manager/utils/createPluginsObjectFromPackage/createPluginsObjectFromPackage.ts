import fs from 'node:fs';

import { handleUnknownError, InvalidFormatError } from '@shared/utils';
import { isString } from '@shared/helpers/typeHelpers';

import { extractDependencies } from '..';

import findPackageJson from '../../helpers/findPackageJson';

import type { GulpPluginManagerOptions } from '../../types';

import { PLUGIN_NAME, SEARCH_FILE } from '../../constants';

interface CreatePluginsObjectFromPackageProps extends Pick<GulpPluginManagerOptions, 'patternOptions' | 'scopes'> {
	configPath: string;
}

/**
 * Asynchronously creates a plugins object from the package.json file.
 *
 * @param {CreatePluginsObjectFromPackageProps} props - The properties to configure the plugin object creation.
 * @param {string} [props.configPath] - The path to the package.json file to search for.
 * @param {Array<string>} [props.scopes] - The dependency scopes to extract.
 * @param {PatternOptions} [props.patternOptions] - Options for matching patterns.
 *
 * @returns {Promise<Record<string, string> | null>} A promise resolving to a record of plugin dependencies or null if the package.json file cannot be found or an error occurs.
 *
 * @throws {InvalidFormatError} Throws an error if the configPath is not a string.
 */
export const createPluginsObjectFromPackage = async ({
	configPath = '',
	scopes,
	patternOptions,
}: CreatePluginsObjectFromPackageProps): Promise<Record<string, string> | null> => {
	if (configPath && !isString(configPath)) {
		throw new InvalidFormatError({
			fieldName: 'CreatePluginsObjectFromPackage: configPath',
			receivedValue: configPath,
			expectedType: 'string',
		});
	}

	const packageJsonPath = await findPackageJson({
		configPath,
		cwd: process.cwd(),
	});

	if (!packageJsonPath) {
		return null;
	}

	try {
		const packageJsonObject = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

		const pluginDependencies = extractDependencies({
			packageJsonObject,
			scopes,
			patternOptions,
		});

		return pluginDependencies;
	} catch (error: unknown) {
		handleUnknownError({
			pluginName: PLUGIN_NAME,
			message: `Failed to load dependencies from ${SEARCH_FILE} file.`,
			error,
		});

		return null;
	}
};
