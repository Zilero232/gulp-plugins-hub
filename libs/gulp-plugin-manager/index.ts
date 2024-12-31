import { InvalidFormatError } from '@shared/utils';
import { isObject } from '@shared/helpers/typeHelpers';

import { createPluginsObjectFromPackage, importPluginsFromPackage, pluginVersionChecker } from './utils';

import defaultOptions from './config/PluginOptionsDefault';

import type { GulpPluginManagerOptions, GulpPluginObject } from './types';

const GulpPluginManager = async (overrideOptions: GulpPluginManagerOptions) => {
	if (overrideOptions && !isObject(overrideOptions)) {
		throw new InvalidFormatError({
			fieldName: 'options',
			receivedValue: overrideOptions,
			expectedType: 'object',
		});
	}

	const options = {
		...defaultOptions,
		...overrideOptions,
	};

	let plugins: GulpPluginObject = {};

	// Creating a plugin object from package.json with where the key is the plugin name and the value is the plugin version.
	const packagePlugins = await createPluginsObjectFromPackage({
		configPath: options.configPath ?? '',
		scopes: options.scopes,
		patternOptions: options.patternOptions,
	});

	if (packagePlugins && isObject(packagePlugins)) {
		// Checking plugin versions.
		if (options.minVersions) {
			pluginVersionChecker({
				packagePlugins,
				minVersions: options.minVersions,
			});
		}

		// Importing plugins from package.json
		const importedPlugins = await importPluginsFromPackage({
			pluginDependencies: packagePlugins,
			formatName: options.formatName,
		});

		if (plugins && isObject(plugins)) {
			plugins = importedPlugins;
		}
	}

	return {
		getPlugin: (pluginName: string) => plugins[pluginName] || null,
		getAllPlugins: () => plugins,
		resetPlugins: () => Object.keys(plugins).forEach((key) => delete plugins[key]),
	};
};

export default GulpPluginManager;
