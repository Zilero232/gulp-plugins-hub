import type { PluginStream } from '@zilero/gulp-plugin-factory';

import {
  applySourceMap,
  createPlugin,
  getInputSourceMap,
  parseOptions,
  toPosixPath
} from '@zilero/gulp-plugin-factory';
import { minify } from 'terser';

import type { JsSqueezerOptions } from './js-squeezer.schema';

import { JS_EXTENSIONS, PLUGIN_NAME } from './js-squeezer.constants';
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
    filter: (file) => JS_EXTENSIONS.includes(file.extname.toLowerCase()),
    transform: async (file) => {
      let content = file.contents.toString();

      if (onBeforeMinify) {
        content = await onBeforeMinify({ content, file });
      }

      const sourceMap = file.sourceMap ? { content: getInputSourceMap(file), includeSources: true } : false;
      const result = await minify({ [toPosixPath(file.relative)]: content }, { ...terserOptions, sourceMap });

      content = result.code ?? '';

      if (onAfterMinify) {
        content = await onAfterMinify({ content, file });
      }

      file.contents = Buffer.from(content);

      if (file.sourceMap && result.map) {
        applySourceMap({ file, map: result.map });
      }
    }
  });
};
