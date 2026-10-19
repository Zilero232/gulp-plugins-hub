import type Vinyl from 'vinyl';

import { Transform } from 'node:stream';

import type {
  FlushStreamInput,
  PassesThroughInput,
  PluginContext,
  PluginDefinition,
  PluginStream,
  TransformFileInput,
  TransformResult
} from './create-plugin.types';

import { toPluginError } from './to-plugin-error';

const createContext = ({ definition, stream }: FlushStreamInput): PluginContext => ({
  name: definition.name,
  push: (file) => stream.push(file)
});

const passesThrough = ({ definition, file }: PassesThroughInput): boolean => {
  if (definition.filter && !definition.filter(file)) {
    return true;
  }

  return definition.accept !== 'any' && file.isNull();
};

const runTransform = async ({ definition, file, stream }: TransformFileInput): Promise<TransformResult> => {
  const context = createContext({ definition, stream });

  if (definition.accept === 'any') {
    return definition.transform?.(file, context);
  }

  if (!file.isBuffer()) {
    throw new Error('Streaming is not supported');
  }

  return definition.transform?.(file, context);
};

const transformFile = async ({ definition, file, stream }: TransformFileInput): Promise<void> => {
  if (passesThrough({ definition, file })) {
    stream.push(file);
    return;
  }

  const result = await runTransform({ definition, file, stream });

  if (result === null) {
    return;
  }

  const outputs = result === undefined ? [file] : [result].flat();

  for (const output of outputs) {
    stream.push(output);
  }
};

const flushStream = async ({ definition, stream }: FlushStreamInput): Promise<void> => {
  await definition.flush?.(createContext({ definition, stream }));
};

/**
 * Creates a gulp plugin stream from a definition. Files go through `transform` one at a time and in order;
 * errors become PluginErrors prefixed with the plugin name and are emitted, never thrown.
 *
 * @example
 * const banner = (text: string) =>
 *   createPlugin({
 *     name: 'gulp-banner',
 *     transform: (file) => {
 *       file.contents = Buffer.concat([Buffer.from(text), file.contents]);
 *     }
 *   });
 */
export const createPlugin = (definition: PluginDefinition): PluginStream => {
  const { name } = definition;

  const stream: Transform = new Transform({
    objectMode: true,
    transform: (file: Vinyl, _encoding, callback) => {
      // Inside the promise, so a filter that throws is a PluginError like any other.
      transformFile({ definition, file, stream }).then(
        () => callback(),
        (error: unknown) => callback(toPluginError({ name, error, file }))
      );
    },
    flush: (callback) => {
      flushStream({ definition, stream }).then(
        () => callback(),
        (error: unknown) => callback(toPluginError({ name, error }))
      );
    }
  });

  return stream;
};
