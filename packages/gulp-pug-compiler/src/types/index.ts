import type { Options } from 'pug';

// Options for the GulpPugCompiler plugin.
export interface GulpPugCompilerOptions {
  pugOptions?: Options;
  pluginOptions?: {
    logFinal?: boolean;
    logProgress?: boolean;
    onAfterCompile?: (minifiedContent: string) => string | Promise<string>;
    onBeforeCompile?: (content: string) => string | Promise<string>;
  }
}
