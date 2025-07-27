import type { TransformFunction, FlushCallback } from 'through2';

import through2 from 'through2';

import type { TransformStream } from '@/shared/schemas';

import type { Flusher, Transformer } from '../types';

export const createThroughStream = (transformer: Transformer, flusher: Flusher): TransformStream => {
  const transformFunction: TransformFunction = async function(this, file, encoding, callback) {
			try {
        const result = await transformer(file, encoding, this);

        if (result instanceof Error) {
          return callback(result);
        }

				if (result) {
          // If the result is not null, call the callback with the result.
          callback(null, result);
				} else {
          // If the result is null, don't pass the file (skip it)
          callback();
        }
			} catch (error: unknown) {
				callback(error as Error);
			}
  }

   const flushFunction: FlushCallback = async function(this, callback) {
    try {
      await flusher(this);

      callback();
    } catch (error: unknown) {
      throw new Error('Flusher function is required and must be a function.');
    }
  }

	return through2.obj(transformFunction, flushFunction);
};

export default createThroughStream;
