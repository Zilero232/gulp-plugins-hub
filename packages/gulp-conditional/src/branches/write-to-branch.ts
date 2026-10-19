import { once } from 'node:events';
import { finished } from 'node:stream/promises';

import type { WriteToBranchInput } from './branches.types';

/**
 * Writes a file into a branch and waits while the branch asks to slow down. A branch that fails or closes in the
 * meantime ends the wait with its error: a destroyed stream never emits `drain`.
 */
export const writeToBranch = async ({ branch, file }: WriteToBranchInput): Promise<void> => {
  if (branch.destroyed) {
    throw branch.errored ?? new Error('The branch stream was closed');
  }

  if (branch.write(file)) {
    return;
  }

  const controller = new AbortController();
  const drained = once(branch, 'drain', { signal: controller.signal });
  const closed = finished(branch, { signal: controller.signal });

  // The promise that loses the race rejects when aborted; nothing waits for it.
  drained.catch(() => {});
  closed.catch(() => {});

  try {
    await Promise.race([drained, closed]);
  } finally {
    controller.abort();
  }
};
