import type { PluginFactoryOptions, TransformStream } from './types';

import { createFileTransformHandler } from './handlers/createFileTransformHandler';
import { createOnFinishHandler } from './handlers/createOnFinishHandler';

import { createThroughStream } from './utils';

/**
 * Creates a Gulp plugin that can be used to transform files.
 *
 * @remarks
 * The plugin will call the onFile function for each file in the stream, passing
 * the file, encoding, and stream as arguments. If the onFile function throws an
 * error, it will be caught and handled by the handleUnknownError function.
 *
 * The plugin will also call the onFinish function once the stream is finished.
 *
 * @returns A Gulp plugin that can be used to transform files.
 *
 * @example
 * ```ts
 * import PluginFactory from '@zilero/gulp-plugin-factory';
 *
 * const plugin = PluginFactory({
 *   onFile: async (file) => {
 *     // Do something with the file
 *     return file;
 *   },
 *   onFinish: async (stream) => {
 *     // Do something with the stream
 *   }
 * });
 */
const PluginFactory = (options: PluginFactoryOptions): TransformStream => {
  const { onFile, onFinish } = options;

	// Checking for the presence of the onFile function.
	if (!onFile || typeof onFile !== 'function') {
		throw new Error('onFile function is required and must be a function.');
	}

	// Checking for the presence of the onFinish function.
	if (onFinish && typeof onFinish !== 'function') {
		throw new Error('onFinish function is required and must be a function.');
	}

	const fileTransformHandler = createFileTransformHandler(options);
	const onFinishHandler = createOnFinishHandler(options);

	return createThroughStream(fileTransformHandler, onFinishHandler);
};

export default PluginFactory;
