import { InvalidFormatError } from '@shared/utils';
import { isString } from '@shared/helpers/typeHelpers';

import type { NameFormatsValues } from '../types';
import { NameFormatsTypes } from '../types';

interface ProcessPluginNameProps {
	pluginName: string;
	formatName?: NameFormatsValues;
}

/**
 * Process plugin name according to given format.
 *
 * @param {string} pluginName - Plugin name to process.
 * @param {NameFormatsValues} nameFormat - Format to process the plugin name.
 * Available formats: camelCase, kebabCase, snakeCase, pascalCase, upperCase, lowerCase, constantCase.
 *
 * @returns {string} Processed plugin name.
 *
 * @throws {InvalidFormatError} If plugin name or name format is not valid.
 */
const processPluginName = ({ pluginName, formatName }: ProcessPluginNameProps) => {
	if (!pluginName || !isString(pluginName)) {
		throw new InvalidFormatError({
			fieldName: 'ProcessPluginName: pluginName',
			receivedValue: pluginName,
			expectedType: 'string',
		});
	}

	if (!formatName || !isString(formatName)) {
		throw new InvalidFormatError({
			fieldName: 'ProcessPluginName: formatName',
			receivedValue: formatName,
			expectedType: Object.keys(NameFormatsTypes).join(' | '),
		});
	}

	switch (formatName) {
		// Fox example: my-variable-name -> myVariableName
		case NameFormatsTypes.camelCase:
			return pluginName.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

		// Fox example: my-variable-name -> my_variable_name
		case NameFormatsTypes.kebabCase:
			return pluginName.toLowerCase().replace(/_/g, '-');

		// Fox example: my-variable-name -> my_variable_name
		case NameFormatsTypes.snakeCase:
			return pluginName.toLowerCase().replace(/-/g, '_');

		// Fox example: my-variable-name -> MyVariableName
		case NameFormatsTypes.pascalCase:
			return pluginName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/^([a-z])/, (g) => g.toUpperCase());

		// Fox example: my-variable-name -> MYVARIABLENAME
		case NameFormatsTypes.upperCase:
			return pluginName.toUpperCase();

		// Fox example: my-variable-name -> myvariablename
		case NameFormatsTypes.lowerCase:
			return pluginName.toLowerCase();

		// Fox example: my-variable-name -> MY_VARIABLE_NAME
		case NameFormatsTypes.constantCase:
			return pluginName.toUpperCase().replace(/-/g, '_');

		// If the format is not specified, then delete gulp-prefix.
		default:
			return pluginName.replace(/^gulp(-|\.)/, '');
	}
};

export default processPluginName;
