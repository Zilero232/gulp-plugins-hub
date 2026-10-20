import type Vinyl from 'vinyl';

/**
 * The file's source map as JSON, to pass to a tool as its input map; undefined when there is nothing to chain.
 * `src(…, { sourcemaps: true })` gives a file without a map of its own one with empty mappings, and chaining
 * that would leave the tool's output map empty too.
 */
export const getInputSourceMap = (file: Vinyl): string | undefined => {
  const map: unknown = file.sourceMap;
  const hasMappings = typeof map === 'object' && map !== null && 'mappings' in map && map.mappings !== '';

  return hasMappings ? JSON.stringify(map) : undefined;
};
