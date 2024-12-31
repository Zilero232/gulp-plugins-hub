import { createFileTransformHandler } from './handlers/createFileTransformHandler';
import { createOnFinishHandler } from './handlers/createOnFinishHandler';

import { createThroughStream } from './utils';

import type { PluginFactoryOptions, TransformStream } from './types';

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
 */
const PluginFactory = (options: PluginFactoryOptions): TransformStream => {
	const fileTransformHandler = createFileTransformHandler(options);
	const onFinishHandler = createOnFinishHandler(options);

	return createThroughStream(fileTransformHandler, onFinishHandler);
};

export default PluginFactory;
