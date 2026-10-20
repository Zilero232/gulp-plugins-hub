import type { Vinyl } from '@zilero/gulp-plugin-factory';
import type { Stats } from 'node:fs';

import { firstBy } from 'remeda';

/**
 * A copy of the stat of the most recently modified input, for the bundle: `dest` then gives the bundle that
 * modification time, so `file-changed` and similar plugins can compare against it. Undefined when no input has one.
 */
export const getNewestStat = (files: Vinyl[]): Stats | undefined => {
  const newest = firstBy(
    files.filter((file) => file.stat),
    [(file) => file.stat?.mtimeMs ?? 0, 'desc']
  );

  // Vinyl's clone copies the stat with its prototype, so `isFile()` and the rest keep working.
  return newest?.clone({ contents: false }).stat ?? undefined;
};
