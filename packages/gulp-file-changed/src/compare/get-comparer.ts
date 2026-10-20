import { readFile } from 'node:fs/promises';
import { match } from 'ts-pattern';

import type { CompareFunction, CompareMode } from '../file-changed.types';

/**
 * Newer than the built file, in whole milliseconds: `dest` writes the modification time with millisecond
 * precision, so the fraction a source keeps would make every file look newer. The built time is rounded, not
 * floored: set through a float of seconds, `1234` ms can come back as `1233.9999…`. A file without a stat always
 * counts as changed.
 */
const compareMtime: CompareFunction = ({ file, target }) =>
  !file.stat || Math.floor(file.stat.mtimeMs) > Math.round(target.stat.mtimeMs);

/** Different bytes; a file without Buffer contents always counts as changed. */
const compareContents: CompareFunction = async ({ file, target }) =>
  !file.isBuffer() || !file.contents.equals(await readFile(target.path));

/** The comparison for a mode, or the user's own function. */
export const getComparer = (compare: CompareFunction | CompareMode): CompareFunction =>
  typeof compare === 'function'
    ? compare
    : match(compare)
        .with('mtime', () => compareMtime)
        .with('contents', () => compareContents)
        .exhaustive();
