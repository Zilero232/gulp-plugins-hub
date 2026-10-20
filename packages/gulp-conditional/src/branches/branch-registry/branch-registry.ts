import { toPluginError } from '@zilero/gulp-plugin-factory';
import { finished } from 'node:stream/promises';

import type { BranchStream } from '../../conditional.types';
import type { BranchRegistry } from './branch-registry.types';

import { DEFAULT_BRANCH, PLUGIN_NAME } from '../../conditional.constants';
import { createBranchStream } from '../create-branch-stream';

/** Keeps the branch streams of one conditional: each is created on its first file and ended with the stream. */
export const createBranchRegistry = (): BranchRegistry => {
  const streams = new Map<number, BranchStream>();
  let failure: unknown;

  const throwIfFailed = (): void => {
    if (failure) {
      throw failure;
    }
  };

  return {
    open: ({ index, handler, push }) => {
      const existing = streams.get(index);

      if (existing) {
        return existing;
      }

      const name = index === DEFAULT_BRANCH ? 'defaultHandler' : `handlers[${index}].handler`;
      const branch = createBranchStream({ handler, name });

      branch.on('data', push);

      // Kept for the next write or the flush, which then fail with it.
      branch.on('error', (error: unknown) => {
        // Wrapped now, so the error is not later attributed to whichever file is processed next.
        failure ??= toPluginError({ name: PLUGIN_NAME, error });
      });

      streams.set(index, branch);

      return branch;
    },
    throwIfFailed,
    closeAll: async () => {
      for (const branch of streams.values()) {
        branch.end();
      }

      try {
        await Promise.all([...streams.values()].map((branch) => finished(branch)));
      } catch (error) {
        // The error the branch emitted, wrapped when it happened, rather than whatever `finished` rejects with.
        throwIfFailed();

        throw toPluginError({ name: PLUGIN_NAME, error });
      }
    },
    destroyAll: () => {
      for (const branch of streams.values()) {
        branch.destroy();
      }
    }
  };
};
