import { Duplex, pipeline } from 'node:stream';

import type { BranchStream } from '../../conditional.types';
import type { CreateBranchStreamInput } from './create-branch-stream.types';

import { isBranchStream } from '../is-branch-stream';

const typeName = (value: unknown): string => (value === null ? 'null' : typeof value);

/**
 * Calls a handler and makes one stream of what it returns: files go into the first stream of a chain and come
 * out of the last; an error from any of them fails the whole chain.
 */
export const createBranchStream = ({ handler, name }: CreateBranchStreamInput): BranchStream => {
  const returned: unknown[] = [handler()].flat();
  const invalidIndex = returned.findIndex((value) => !isBranchStream(value));

  if (invalidIndex !== -1) {
    throw new TypeError(`${name} must return a stream or an array of streams, got ${typeName(returned[invalidIndex])}`);
  }

  const [first, ...rest] = returned.filter(isBranchStream);
  const last = rest.at(-1);

  if (!first) {
    throw new Error(`${name} returned an empty array; return at least one stream`);
  }

  if (!last) {
    return first;
  }

  // The callback only keeps pipeline from throwing: the error reaches the chain through first and last.
  pipeline([first, ...rest], () => {});

  return Duplex.from({ writable: first, readable: last });
};
