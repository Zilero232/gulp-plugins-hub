import type { PluginStream } from '@zilero/gulp-plugin-factory';

import {
  applySourceMap,
  createPlugin,
  getInputSourceMap,
  parseOptions,
  runContentHook,
  toPosixPath
} from '@zilero/gulp-plugin-factory';
import { minify } from 'terser';

import type { JsSqueezerOptions } from './js-squeezer.schema';

import { JS_EXTENSIONS, MODULE_BY_EXTENSION, PLUGIN_NAME } from './js-squeezer.constants';
import { jsSqueezerOptionsSchema } from './js-squeezer.schema';

/**
 * Minifies JavaScript (`.js`, `.mjs`, `.cjs`) with terser; other files pass through. When the file has a
 * source map (`src(…, { sourcemaps: true })`), the new map is chained to it.
 *
 * @example
 * src('src/**\/*.js', { sourcemaps: true })
 *   .pipe(jsSqueezer({ terserOptions: { compress: { drop_console: true } } }))
 *   .pipe(dest('dist', { sourcemaps: '.' }));
 */
export const jsSqueezer = (options: JsSqueezerOptions = {}): PluginStream => {
  const {
    terserOptions = {},
    onBeforeMinify,
    onAfterMinify
  } = parseOptions({
    name: PLUGIN_NAME,
    schema: jsSqueezerOptionsSchema,
    options
  });

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: JS_EXTENSIONS,
    transform: async (file) => {
      const source = await runContentHook({
        name: 'onBeforeMinify',
        hook: onBeforeMinify,
        content: file.contents.toString(),
        file
      });

      const sourceMap = file.sourceMap ? { content: getInputSourceMap(file), includeSources: true } : false;
      const isModule = terserOptions.module ?? MODULE_BY_EXTENSION[file.extname.toLowerCase()] ?? false;

      const result = await minify(
        { [toPosixPath(file.relative)]: source },
        { ...terserOptions, module: isModule, sourceMap }
      );

      if (result.code === undefined) {
        throw new Error('terser returned no code');
      }

      const content = await runContentHook({ name: 'onAfterMinify', hook: onAfterMinify, content: result.code, file });

      file.contents = Buffer.from(content);

      if (file.sourceMap && result.map) {
        applySourceMap({ file, map: result.map });
      }
    }
  });
};
