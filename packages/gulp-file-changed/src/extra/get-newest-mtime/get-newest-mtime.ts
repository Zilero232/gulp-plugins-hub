import { stat } from 'node:fs/promises';
import { firstBy } from 'remeda';
import { glob } from 'tinyglobby';

import type { GetNewestMtimeInput } from './get-newest-mtime.types';

/** The newest modification time of the files the globs match, in milliseconds; undefined when none match. */
export const getNewestMtime = async ({ patterns, cwd }: GetNewestMtimeInput): Promise<number | undefined> => {
  const files = await glob(patterns, { cwd, absolute: true, onlyFiles: true, dot: true });
  const stats = await Promise.all(files.map((file) => stat(file)));

  return firstBy(stats, [({ mtimeMs }) => mtimeMs, 'desc'])?.mtimeMs;
};
