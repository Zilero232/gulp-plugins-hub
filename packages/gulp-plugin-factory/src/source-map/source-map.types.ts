import type Vinyl from 'vinyl';

/** A version 3 source map, the shape gulp keeps in `file.sourceMap` and tools produce. */
export type SourceMap = {
  version: number | string;
  file?: string | null;
  sourceRoot?: string | null;
  sources: readonly (string | null)[];
  sourcesContent?: readonly (string | null)[] | null;
  names: readonly string[];
  mappings: string;
};

export type ApplySourceMapInput = {
  file: Vinyl;
  /** The map the tool produced, as an object or as JSON. */
  map: string | SourceMap;
  /**
   * Chain the file's current map into the new one, for tools that cannot take an input map themselves.
   * The new map's only source must be the file itself. Default false.
   */
  chain?: boolean;
};

export type KeepSourcesContentInput = {
  /** The file's map before the tool ran. */
  previous: unknown;
  /** The new map's sources, already relative to the base. */
  sources: (string | null)[];
  parsed: SourceMap;
};

export type ToRelativeSourceInput = {
  base: string;
  source: string;
};
