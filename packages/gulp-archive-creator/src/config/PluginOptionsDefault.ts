import type { GulpArchiveCreatorOptions } from '../schema';

const defaultOptions: GulpArchiveCreatorOptions = {
  format: 'zip',
	pluginOptions: {
		archiveName: 'archive',
		createDirectory: false,
		createEmptyArchive: false,
		logProgress: true,
		logFinal: true,
	},
};

export default defaultOptions;
