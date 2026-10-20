import type Vinyl from 'vinyl';

import type { SourceMap } from '../source-map.types';

export type ApplySourceMapInput = {
  file: Vinyl;
  /** The map the tool produced, as an object or as JSON. */
  map: string | SourceMap;
  /**
   * Chain the file's current map into the new one, for tools that cannot take an input map themselves.
   * Only the sources that are the file itself get its map; others (an inlined import) stay as they are.
   * Default false.
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
