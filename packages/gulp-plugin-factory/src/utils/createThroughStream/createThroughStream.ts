import type { TransformCallback } from 'through2';

import through2 from 'through2';

import type { Flusher, Transformer, TransformStream } from '../../types';

type TransformFunction = (this: TransformStream, file: FileVinyl, encoding: BufferEncoding, callback: TransformCallback) => void;
type FlushFunction = (this: TransformStream, callback: () => void) => void;

export const createThroughStream = (transformer: Transformer, flusher: Flusher): TransformStream => {
	// Checking for the presence of the transformer function.
	if (!transformer) {
		throw new Error('Transformer function is required and must be a function.');
	}

	// Checking for the presence of the flusher function.
	if (!flusher) {
		throw new Error('Flusher function is required and must be a function.');
	}

  const transformFunction: TransformFunction = async function(this, file, encoding, callback) {
			if (file.isNull()) {
        // If the file is null, call the callback with the file.
				return callback(new Error('File is null.'));
			}

			if (file.isStream()) {
				// If the file is not a stream, throw an error.
				return callback(new Error('Streaming not supported.'));
			}

			try {
				const result = await transformer(file, encoding, this);

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

   const flushFunction: FlushFunction = async function(this, callback) {
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
