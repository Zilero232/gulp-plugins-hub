import through2 from 'through2';

import type { ConditionalHandler, GulpConditionalOptions } from './types';

import defaultOptions from './config/PluginOptionsDefault';

/**
 * Conditional plugin that allows you to execute different handlers based on conditions.
 *
 * @example
 * import GulpConditional from "@zilero/gulp-conditional";
 *
 * gulp.src("src/*.js")
 *   .pipe(GulpConditional({
 *     handlers: [
 *       {
 *         condition: () => true,
 *         handler: GulpJsSqueezer({
 *           minifyOptions: {
 *             compress: {
 *               drop_console: true,
 *             },
 *           },
 *         }),
 *       },
 *       {
 *         condition: () => false,
 *         handler: GulpFileExclude({
 *           patterns: ['2'],
 *         }),
 *       },
 *     ],
 *     defaultHandler: GulpFileExclude({
 *       patterns: ['3'],
 *     }),
 *   }))
 *   .pipe(gulp.dest("dist"));
 */
const GulpConditional = <T = ReturnType<typeof through2.obj>>(options: GulpConditionalOptions<T>) => {
  const { handlers, defaultHandler } = { ...defaultOptions, ...options };

  if (!handlers.length) {
    throw new Error('At least one handler is required');
  }

  try {
    // Find the first matching handler
    const matchedHandler = handlers.find(({ condition }: ConditionalHandler<T>) =>
      typeof condition === 'function' ? condition() : Boolean(condition)
    );

    // Use the matched handler or defaultHandler
    return matchedHandler?.handler || defaultHandler || through2.obj();
  } catch (error) {
    const stream = through2.obj();

    stream.emit('error', error instanceof Error ? error : new Error(String(error)));

    return stream;
  }
};

export default GulpConditional;
