import type { GulpArchiveCreatorOptions } from '../types';

const defaultOptions: GulpArchiveCreatorOptions = {
  format: 'zip',
	pluginOptions: {
		archiveName: 'archive',
		createDirectory: false,
		createEmptyArchive: false,
		excludeFiles: [],
		logProgress: true,
		logFinal: true,
	},
};

export default defaultOptions;
