import type { MinifyOptions } from 'terser';

// Options for the GulpJsSqueezer plugin.
export interface GulpJsSqueezerOptions extends MinifyOptions {
	logStream?: boolean; // Log the processing of each file.
	logEnd?: boolean; // Log the completion of the process.
	skipFilesWithoutExtension?: boolean; // Skip files without an extension .html.
	onBeforeMinify?: (content: string) => string | Promise<string>; // Hook before minification.
	onAfterMinify?: (minifiedContent: string) => string | Promise<string>; // Hook after minification.
}
