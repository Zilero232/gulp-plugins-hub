import { toPluginError } from '@zilero/gulp-plugin-factory';
import { Duplex, pipeline } from 'node:stream';
import { finished } from 'node:stream/promises';

import type { BranchStream } from '../conditional.types';
import type { BranchRegistry } from './branches.types';

import { PLUGIN_NAME } from '../conditional.constants';

/** One stream for a chain of plugins: files go into the first, come out of the last; any error fails it. */
const chainStreams = (streams: BranchStream[]): BranchStream => {
  const [first, ...rest] = streams;
  const last = rest.at(-1);

  if (!first) {
    throw new Error('A handler returned an empty array; return at least one stream');
  }

  if (!last) {
    return first;
  }

  // The callback only keeps pipeline from throwing: the error reaches the chain through first and last.
  pipeline(streams, () => {});

  return Duplex.from({ writable: first, readable: last });
};

/** Keeps the branch streams of one conditional: each is created on its first file and ended with the stream. */
export const createBranchRegistry = (): BranchRegistry => {
  const streams = new Map<number, BranchStream>();
  let failure: unknown;

  return {
    open: ({ index, handler, push }) => {
      const existing = streams.get(index);

      if (existing) {
        return existing;
      }

      const branch = chainStreams([handler()].flat());

      branch.on('data', push);
      // Kept for the next write or the flush, which then fail with it.
      branch.on('error', (error: unknown) => {
        // Wrapped now, so the error is not later attributed to whichever file is processed next.
        failure ??= toPluginError({ name: PLUGIN_NAME, error });
      });

      streams.set(index, branch);

      return branch;
    },
    throwIfFailed: () => {
      if (failure) {
        throw failure;
      }
    },
    closeAll: async () => {
      for (const branch of streams.values()) {
        branch.end();
      }

      await Promise.all([...streams.values()].map((branch) => finished(branch)));
    },
    destroyAll: () => {
      for (const branch of streams.values()) {
        branch.destroy();
      }
    }
  };
};
