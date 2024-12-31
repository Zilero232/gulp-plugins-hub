import type { ZlibOptions } from 'node:zlib';

// Enumeration (enum) specifying possible formats for archiving.
export enum FormatZipOptions {
	Zip = 'zip',
	Tar = 'tar',
}

// Options for working with Zip archives.
interface ZipOptions {
	comment?: string; // Comment added to the archive.
	forceLocalTime?: boolean; // Force the use of local time in the archive.
	forceZip64?: boolean; // Force the use of Zip64 format (for large files).
	namePrependSlash?: boolean; // Whether to prepend a slash before the filename in the archive.
	store?: boolean; // Store files uncompressed.
	zlib?: ZlibOptions; // Options for compression using zlib.
}

// Options for working with Tar archives
interface TarOptions {
	gzip?: boolean; // Whether to use gzip for Tar compression.
	gzipOptions?: ZlibOptions; // Options for configuring gzip compression.
}

// Options for transforming data in streams
export interface GulpArchiveCreatorOptions {
	format: FormatZipOptions; // Archiving formats.
	formats?: {
		[FormatZipOptions.Zip]?: ZipOptions;
		[FormatZipOptions.Tar]?: TarOptions;
	};
	archiveName: string; // Name of the output archive.
	outputPath: string; // Path for saving the archive.
	excludeFiles?: string[]; // Array of files to exclude from the archive.
	createDirectory?: boolean; // Whether to create a directory in the archive.
	logProgress?: boolean; // Log progress.
	logFinal?: boolean; // Log the end of the process.
	createEmptyArchive?: boolean; // Whether to create an empty archive.
	statConcurrency?: number; // Added to set the number of concurrent fs.stat calls.
}
