import { InvalidFormatError } from '@shared/utils';
import { isBoolean, isObject } from '@shared/helpers/typeHelpers';

import type { KeysPostCssOptions, PostCssOptions } from '../types';

interface ValidatePluginOptions<T extends KeysPostCssOptions> {
	pluginName?: string;
	pluginOptions?: PostCssOptions[T];
}

/**
 * Проверяет правильность опций PostCSS плагинов.
 *
 * @param {string} pluginName - Название плагина.
 * @param {ValidatePluginOptions} pluginConfig - Опции плагина.
 *
 * @returns {boolean} - Возвращает true, если плагин может быть активирован.
 * @throws {Error} - Если параметры некорректны.
 */
const validatePluginOptions = <T extends KeysPostCssOptions>({ pluginName, pluginOptions }: ValidatePluginOptions<T>): boolean => {
	if (!pluginName || !pluginOptions) {
		return false;
	}

	if (pluginOptions.enabled && !isBoolean(pluginOptions.enabled)) {
		throw new InvalidFormatError({
			fieldName: pluginName,
			receivedValue: pluginOptions.enabled,
			expectedType: 'boolean',
		});
	}

	if (pluginOptions.options && !isObject(pluginOptions.options)) {
		throw new InvalidFormatError({
			fieldName: pluginName,
			receivedValue: pluginOptions.options,
			expectedType: 'Object',
		});
	}

	return pluginOptions.enabled ?? false;
};

export default validatePluginOptions;
