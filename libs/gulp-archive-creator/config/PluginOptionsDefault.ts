import type { GulpArchiveCreatorOptions } from '../types';
import { FormatZipOptions } from '../types';

const defaultOptions: GulpArchiveCreatorOptions = {
	format: FormatZipOptions.Zip,
	archiveName: 'archive.zip',
	outputPath: './',
	excludeFiles: [],
	createDirectory: false,
	logProgress: true,
	logFinal: true,
	createEmptyArchive: false, // Adding an option to create an empty archive.
};

export default defaultOptions;
