import type { ArchiverOptions, Format } from 'archiver';

// Options for the plugin.
export interface PluginOptions {
	archiveName: string;
	createDirectory?: boolean;
	createEmptyArchive?: boolean;
	excludeFiles?: string[];
	logFinal?: boolean;
	logProgress?: boolean;
}

// Options for the plugin.
export interface GulpArchiveCreatorOptions {
	format: Format;
	archiveOptions?: ArchiverOptions;
	pluginOptions: PluginOptions;
}
