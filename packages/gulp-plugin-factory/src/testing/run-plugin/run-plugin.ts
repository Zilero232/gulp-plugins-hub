import type { Transform } from 'node:stream';
import type Vinyl from 'vinyl';

/**
 * Writes the files into a plugin stream, ends it and resolves with every file it emitted, in order.
 * Rejects with the first error the stream emits.
 *
 * @example
 * const [output] = await runPlugin(refilename({ suffix: '.min' }), [createFile({ path: 'app.js' })]);
 */
export const runPlugin = async (stream: Transform, files: Vinyl[]): Promise<Vinyl[]> => {
  const output = stream.toArray();

  for (const file of files) {
    stream.write(file);
  }

  stream.end();

  return output;
};
