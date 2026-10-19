import type { Stats } from 'node:fs';

import { stat } from 'node:fs/promises';

/** The stat of the built file, or undefined when it does not exist yet; other errors are thrown. */
export const statTarget = async (targetPath: string): Promise<Stats | undefined> => {
  try {
    return await stat(targetPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }

    throw error;
  }
};
