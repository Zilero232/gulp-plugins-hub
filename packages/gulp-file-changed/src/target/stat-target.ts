import type { Stats } from 'node:fs';

import { stat } from 'node:fs/promises';

/** Errors that mean the built file is not there: missing, or a file where `dest` expects a folder. */
const MISSING_CODES = new Set(['ENOENT', 'ENOTDIR']);

/** The stat of the built file, or undefined when it does not exist yet; other errors are thrown. */
export const statTarget = async (targetPath: string): Promise<Stats | undefined> => {
  try {
    return await stat(targetPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && typeof error.code === 'string' && MISSING_CODES.has(error.code)) {
      return undefined;
    }

    throw error;
  }
};
