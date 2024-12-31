import GulpPluginFactory from '@zilero/gulp-plugin-factory';
import GulpWinstonLogger from '@zilero/gulp-winston-logger';

import { isObject, isString } from '@shared/helpers/typeHelpers';

import type { GulpRefilenameOptions } from './types';

import { PLUGIN_NAME } from './constants';

type GulpRefilenameProps = string | GulpRefilenameOptions;

const GulpRefilename = (options: GulpRefilenameProps) => {
	if (!isObject(options) || !isString(options)) {
		return GulpWinstonLogger({
			pluginName: PLUGIN_NAME,
			message: 'Invalid options type for renaming. It must be an object or string',
		});
	}

	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: (file: FileVinyl) => {
			let newFileName: string = '';

			// Логика на основе типа `options`
			if (isString(options)) {
				newFileName = options; // Простое переименование
			} else if (isObject(options)) {
				const { prefix = '', suffix = '', extname = file.extname, dirname = file.dirname, multiExt = false } = options;

				// Формируем новое имя файла
				const baseName = multiExt ? file.relative.replace(/(\.[^/.]+)+$/, '') : file.stem;

				// Формируем новое имя файла
				newFileName = `${dirname}/${prefix}${baseName}${suffix}${extname}`;
			}

			// Устанавливаем новый путь файла
			file.path = file.base + newFileName;

			// Переименовываем sourcemap, если он существует
			if (file.sourceMap) {
				file.sourceMap.file = newFileName;
			}

			return file;
		},
	});
};

export default GulpRefilename;
