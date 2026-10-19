import path from 'node:path';

/** A path with `/` separators on every OS, for globs, archive entries, manifests and source maps. */
export const toPosixPath = (value: string): string => value.split(path.sep).join('/');
