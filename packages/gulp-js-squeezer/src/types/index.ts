import type { MinifyOptions } from 'terser';

// Options for the GulpJsSqueezer plugin.
export interface GulpJsSqueezerOptions {
  minifyOptions?: MinifyOptions;
  pluginOptions?: {
    logFinal?: boolean;
    logProgress?: boolean;
    onAfterMinify?: (minifiedContent: string) => string | Promise<string>;
    onBeforeMinify?: (content: string) => string | Promise<string>;
  }
}
