import through2 from 'through2';

import { createPluginOptions } from '@/shared/utils/plugin-options/createPluginOptions';

import defaultOptions from './config/PluginOptionsDefault';

import { gulpConditionalSchema, type GulpConditionalOptions } from './schema';

import { PLUGIN_NAME } from './constants';

const validateOptions = createPluginOptions({
  name: PLUGIN_NAME,
  schema: gulpConditionalSchema,
  defaults: defaultOptions,
});

// Conditional plugin that allows you to execute different handlers based on conditions.
const GulpConditional = (options: GulpConditionalOptions) => {
  const { handlers, defaultHandler } = validateOptions(options);

  try {
    // Find the first matching handler
    const matchedHandler = handlers.find(({ condition }) =>
      typeof condition === 'function' ? condition() : Boolean(condition)
    );

    // Use the matched handler or defaultHandler
    return matchedHandler ? matchedHandler.handler() : defaultHandler?.() ?? through2.obj();
  } catch (error) {
    const stream = through2.obj();

    stream.emit('error', error instanceof Error ? error : new Error(String(error)));

    return stream;
  }
};

export default GulpConditional;
