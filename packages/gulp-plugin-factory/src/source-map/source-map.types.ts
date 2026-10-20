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
