import type Vinyl from 'vinyl';

import path from 'node:path';

import type { SourceMap } from './source-map.types';

import { getInputSourceMap } from './get-input-source-map';

/**
 * The file's source map with absolute sources, ready to chain into another map with `@jridgewell/remapping`:
 * gulp keeps sources relative to `file.base`, while remapping resolves them against the folder of the map they
 * are chained into. Undefined when there is nothing to chain.
 */
export const getChainableSourceMap = (file: Vinyl): SourceMap | undefined => {
  const json = getInputSourceMap(file);

  if (!json) {
    return undefined;
  }

  const map: SourceMap = JSON.parse(json);
  const root = path.resolve(file.base, map.sourceRoot ?? '');

  return {
    ...map,
    sourceRoot: undefined,
    sources: map.sources.map((source) =>
      source === null || /^[a-z][\w+.-]*:/i.test(source) ? source : path.resolve(root, source)
    )
  };
};
