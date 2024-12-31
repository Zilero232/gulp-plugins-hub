import type { Options } from 'pug';

// Options for the GulpPugCompiler plugin.
export interface GulpPugCompilerOptions extends Options {
	logStream?: boolean; // Log the processing of each file.
	logEnd?: boolean; // Log the completion of the process.
	skipFilesWithoutExtension?: boolean; // Skip files without an extension .html.
	minifyHtml?: boolean; // Minify HTML.
	onBeforeCompile?: (content: string) => string | Promise<string>; // Hook before minification.
	onAfterCompile?: (minifiedContent: string) => string | Promise<string>; // Hook after minification.
}
