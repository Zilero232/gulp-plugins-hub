import type { Options } from 'html-minifier-terser';

// Options for the GulpHtmlSqueezer plugin.
export interface GulpHtmlSqueezerOptions {
  htmlMinifierOptions?: Options;
  pluginOptions?: {
    logProgress?: boolean;
    logFinal?: boolean;
    onAfterMinify?: (minifiedContent: string) => string | Promise<string>;
    onBeforeMinify?: (content: string) => string | Promise<string>;
  }
}
