import type { Transform } from 'node:stream';
import type Vinyl from 'vinyl';

/** A file whose contents are a Buffer: what `transform` receives unless `accept` is `'any'`. */
export type BufferFile = Vinyl & { contents: Buffer };

/**
 * What `transform` returns:
 * - nothing: the (possibly changed) file goes on;
 * - `null`: the file is dropped;
 * - a file or an array of files: those go on instead.
 */
export type TransformResult = Vinyl | Vinyl[] | null | undefined | void;

export type PluginContext = {
  /** The plugin name, as it appears in errors. */
  name: string;
  /** Sends a file downstream, for plugins that emit more files than they receive. */
  push: (file: Vinyl) => void;
};

type PluginDefinitionBase = {
  /** Prefixes every error the plugin emits; use the package name. */
  name: string;
  /**
   * Files it returns false for pass through untouched, before any other check.
   * Use it to limit a plugin to certain extensions.
   */
  filter?: (file: Vinyl) => boolean;
  /**
   * Only files with one of these extensions (`'.css'`, compared in lowercase) are transformed; the others pass
   * through untouched. Checked together with `filter`.
   */
  extensions?: readonly string[];
  /** Runs once after the last file, before the stream ends; `context.push` emits files from here. */
  flush?: (context: PluginContext) => Promise<void> | void;
  /**
   * Runs once when the stream is done: ended, failed or destroyed. Closes what the plugin opened (a compiler
   * process, workers), which `flush` cannot do since it never runs on a destroyed stream.
   */
  dispose?: () => Promise<void> | void;
};

export type BufferPluginDefinition = PluginDefinitionBase & {
  /**
   * `'buffer'` (the default): `transform` gets only files with Buffer contents. Files without contents
   * (directories, `read: false`) pass through, and streamed contents emit an error.
   */
  accept?: 'buffer';
  /**
   * The plugin works on binary formats: files read as UTF-8 text (gulp 5's default without
   * `src(globs, { encoding: false })`) emit an error with the fix, instead of reaching `transform` corrupted.
   */
  binary?: boolean;
  transform?: (file: BufferFile, context: PluginContext) => Promise<TransformResult> | TransformResult;
};

export type AnyPluginDefinition = PluginDefinitionBase & {
  /** `'any'`: `transform` gets every file, whatever its contents. */
  accept: 'any';
  transform?: (file: Vinyl, context: PluginContext) => Promise<TransformResult> | TransformResult;
};

export type PluginDefinition = AnyPluginDefinition | BufferPluginDefinition;

/** The object-mode stream a plugin returns: Vinyl files in, Vinyl files out. */
export type PluginStream = Transform;

export type ToPluginErrorInput = {
  name: string;
  error: unknown;
  /** The file being processed, for `fileName` in the error. */
  file?: Vinyl;
};

export type PassesThroughInput = {
  definition: PluginDefinition;
  file: Vinyl;
};

export type TransformFileInput = {
  definition: PluginDefinition;
  file: Vinyl;
  stream: Transform;
};

export type FlushStreamInput = {
  definition: PluginDefinition;
  stream: Transform;
};
