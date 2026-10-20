import type { SourceMap } from '@zilero/gulp-plugin-factory';

import remapping from '@jridgewell/remapping';
import { getChainableSourceMap } from '@zilero/gulp-plugin-factory';

import type { CreateBundleMapInput } from './bundle.types';

/** The bundle's source map, with each input's own map chained in, so it points at the original sources. */
export const createBundleMap = ({ bundle, sources }: CreateBundleMapInput): SourceMap => {
  const inputMaps = new Map(sources.map(({ name, file }) => [name, getChainableSourceMap(file)]));
  // No `file`: magic-string would make the sources relative to its folder, and applySourceMap sets it anyway.
  const map = bundle.generateMap({ includeContent: true, hires: 'boundary' }).toString();

  const chained = remapping(map, (source, context) => {
    const input = context.depth === 1 ? inputMaps.get(source) : undefined;

    return input ? JSON.stringify(input) : null;
  });

  return JSON.parse(JSON.stringify(chained));
};
