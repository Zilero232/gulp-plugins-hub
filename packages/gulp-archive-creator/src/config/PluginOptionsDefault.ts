import type { GulpArchiveCreatorOptions } from '../schema';

const defaultOptions: GulpArchiveCreatorOptions = {
  format: 'zip',
	pluginOptions: {
		archiveName: 'archive',
		createDirectory: false,
		createEmptyArchive: false,
	},
};

export default defaultOptions;
