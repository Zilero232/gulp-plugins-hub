import remapping from '@jridgewell/remapping';
import path from 'node:path';

import type { ApplySourceMapInput, KeepSourcesContentInput, SourceMap } from './source-map.types';

import { toPosixPath } from '../path';
import { getChainableSourceMap } from './get-chainable-source-map';
import { toRelativeSource } from './to-relative-source';

const parseMap = (map: string | SourceMap): SourceMap => (typeof map === 'string' ? JSON.parse(map) : map);

/**
 * `src(…, { sourcemaps: true })` starts a file without a map of its own with empty mappings and its original
 * text as `sourcesContent`. There is nothing to chain then, but the text must stay, or devtools has no source.
 */
const keepSourcesContent = ({ previous, sources, parsed }: KeepSourcesContentInput): SourceMap['sourcesContent'] => {
  if (
    typeof previous !== 'object' ||
    previous === null ||
    !('sources' in previous) ||
    !('sourcesContent' in previous)
  ) {
    return parsed.sourcesContent;
  }

  const names: unknown[] = Array.isArray(previous.sources) ? previous.sources : [];
  const contents: unknown[] = Array.isArray(previous.sourcesContent) ? previous.sourcesContent : [];

  return sources.map((source, index) => {
    const own = parsed.sourcesContent?.[index];
    const kept = contents[names.findIndex((name) => typeof name === 'string' && toPosixPath(name) === source)];

    return own ?? (typeof kept === 'string' ? kept : null);
  });
};

/**
 * Stores the map a tool produced as `file.sourceMap`, the way gulp's `src(…, { sourcemaps: true })` and
 * `dest(…, { sourcemaps: '.' })` expect it: `file` is the file's relative path and absolute or `file://`
 * sources become relative to `file.base`.
 *
 * The map replaces the previous one: ask the tool to chain the input map (see `getInputSourceMap`), or pass
 * `chain: true` for tools that cannot.
 */
export const applySourceMap = ({ file, map, chain = false }: ApplySourceMapInput): void => {
  const json = typeof map === 'string' ? map : JSON.stringify(map);
  const input = chain ? getChainableSourceMap(file) : undefined;

  // The input map belongs to the file itself: other sources of the tool's map (an inlined import) keep theirs.
  const isFile = (source: string): boolean =>
    path.posix.normalize(toRelativeSource({ base: file.base, source })) === toPosixPath(file.relative);

  const parsed = parseMap(
    input
      ? JSON.stringify(
          remapping(json, (source, context) => (context.depth === 1 && isFile(source) ? JSON.stringify(input) : null))
        )
      : json
  );

  const sources = parsed.sources.map((source) => source && toRelativeSource({ base: file.base, source }));

  file.sourceMap = {
    ...parsed,
    file: toPosixPath(file.relative),
    sources,
    sourcesContent:
      chain && !input ? keepSourcesContent({ previous: file.sourceMap, sources, parsed }) : parsed.sourcesContent
  };
};
