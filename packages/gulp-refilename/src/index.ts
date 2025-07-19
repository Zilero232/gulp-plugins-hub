import GulpPluginFactory from '@zilero/gulp-plugin-factory';

import type { GulpRefilenameOptions } from './types';

import { PLUGIN_NAME } from './constants';

type GulpRefilenameProps = string | GulpRefilenameOptions;

const GulpRefilename = (options: GulpRefilenameProps) => {
	return GulpPluginFactory({
		pluginName: PLUGIN_NAME,
		onFile: async (file: FileVinyl) => {
			let newFileName: string = '';

			// Logic based on the type of `options`.
			if (typeof options === 'string') {
				newFileName = options; // Simple renaming.
			} else if (typeof options === 'object') {
				const { prefix = '', suffix = '', extname = file.extname, dirname = file.dirname, multiExt = false } = options;

				// Forming a new file name.
				const baseName = multiExt ? file.relative.replace(/(\.[^/.]+)+$/, '') : file.stem;

				// Forming a new file name.
				newFileName = `${dirname}/${prefix}${baseName}${suffix}${extname}`;
			}

			// Setting a new file path.
			file.path = file.base + newFileName;

			// Renaming the sourcemap, if it exists.
			if (file.sourceMap) {
				file.sourceMap.file = newFileName;
			}

			return file;
		},
	});
};

export default GulpRefilename;
