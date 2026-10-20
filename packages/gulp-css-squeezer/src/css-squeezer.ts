import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { applySourceMap, createPlugin, parseOptions, runContentHook, toPosixPath } from '@zilero/gulp-plugin-factory';

import type { CssSqueezerOptions } from './css-squeezer.schema';

import { CSS_EXTENSIONS, PLUGIN_NAME } from './css-squeezer.constants';
import { cssSqueezerOptionsSchema } from './css-squeezer.schema';
import { toTargetsResolver } from './targets';
import { transformCss } from './transform';

/**
 * Minifies CSS, adds the vendor prefixes your browsers need and lowers modern syntax (nesting, `oklch()`, …)
 * with Lightning CSS: clean-css and autoprefixer in one pass. Only `.css` files are processed. When the file has
 * a source map, the new map is chained to it.
 *
 * @example
 * src('dist/css/**\/*.css', { sourcemaps: true })
 *   .pipe(cssSqueezer({ targets: '> 0.5%, last 2 versions, not dead' }))
 *   .pipe(dest('dist/css', { sourcemaps: '.' }));
 */
export const cssSqueezer = (options: CssSqueezerOptions = {}): PluginStream => {
  const { targets, minify, lightningcssOptions, onBeforeMinify, onAfterMinify, onWarning } = parseOptions({
    name: PLUGIN_NAME,
    schema: cssSqueezerOptionsSchema,
    options
  });

  const resolveTargets = toTargetsResolver(targets);

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: CSS_EXTENSIONS,
    transform: async (file) => {
      const source = await runContentHook({
        name: 'onBeforeMinify',
        hook: onBeforeMinify,
        content: file.contents.toString(),
        file
      });

      const result = transformCss({
        filePath: file.path,
        options: {
          ...lightningcssOptions,
          filename: toPosixPath(file.relative),
          code: Buffer.from(source),
          minify,
          targets: resolveTargets(file.path),
          sourceMap: Boolean(file.sourceMap),
          // Chained below instead: Lightning CSS would keep the intermediate file as an extra source.
          inputSourceMap: undefined
        }
      });

      if (onWarning) {
        for (const { message, type, loc } of result.warnings) {
          await onWarning({ message, type, line: loc.line, column: loc.column, file });
        }
      }

      const content = await runContentHook({
        name: 'onAfterMinify',
        hook: onAfterMinify,
        content: Buffer.from(result.code).toString(),
        file
      });

      file.contents = Buffer.from(content);

      if (file.sourceMap && result.map) {
        applySourceMap({ file, map: Buffer.from(result.map).toString(), chain: true });
      }
    }
  });
};
