import type { Duplex } from 'node:stream';

import { PassThrough } from 'node:stream';

import type { WhenInput } from './utils.types.ts';

/** A step that runs in one mode only: the stream when the condition holds, a pass-through otherwise. */
export const when = ({ condition, then }: WhenInput): Duplex =>
  condition ? then() : new PassThrough({ objectMode: true });
