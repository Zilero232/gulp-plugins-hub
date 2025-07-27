import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import { createFileTransformHandler } from './handlers/createFileTransformHandler';
import { createOnFinishHandler } from './handlers/createOnFinishHandler';

import { pluginFactoryOptionsSchema } from './schema';
import { type PluginFactoryOptions } from './schema';

import { createThroughStream } from './utils';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: pluginFactoryOptionsSchema
});

/**
 * Creates a Gulp plugin that can be used to transform files.
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
const PluginFactory = (options: PluginFactoryOptions) => {
  // Validate options using Zod schema.
  const validatedOptions = validateOptions(options);

	const fileTransformHandler = createFileTransformHandler(validatedOptions);
	const onFinishHandler = createOnFinishHandler(validatedOptions);

	return createThroughStream(fileTransformHandler, onFinishHandler);
};

export default PluginFactory;
