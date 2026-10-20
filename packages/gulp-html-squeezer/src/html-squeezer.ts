import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions, runContentHook } from '@zilero/gulp-plugin-factory';
import { minify, presets } from 'html-minifier-next';

import type { HtmlSqueezerOptions } from './html-squeezer.schema';

import { HTML_EXTENSIONS, PLUGIN_NAME } from './html-squeezer.constants';
import { htmlSqueezerOptionsSchema } from './html-squeezer.schema';

/**
 * Minifies HTML (`.html`, `.htm`) with html-minifier-next, starting from one of its presets; other files pass
 * through. html-minifier-next makes no source maps, so a map the file arrives with is dropped instead of
 * pointing at text that no longer exists.
 *
 * @example
 * src('dist/**\/*.html')
 *   .pipe(htmlSqueezer({ preset: 'comprehensive', htmlMinifierOptions: { removeAttributeQuotes: false } }))
 *   .pipe(dest('dist'));
 */
export const htmlSqueezer = (options: HtmlSqueezerOptions = {}): PluginStream => {
  const { preset, htmlMinifierOptions, onBeforeMinify, onAfterMinify } = parseOptions({
    name: PLUGIN_NAME,
    schema: htmlSqueezerOptionsSchema,
    options
  });

  const minifierOptions = { ...(preset && presets[preset]), ...htmlMinifierOptions };

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: HTML_EXTENSIONS,
    transform: async (file) => {
      const source = await runContentHook({
        name: 'onBeforeMinify',
        hook: onBeforeMinify,
        content: file.contents.toString(),
        file
      });

      const content = await runContentHook({
        name: 'onAfterMinify',
        hook: onAfterMinify,
        content: await minify(source, minifierOptions),
        file
      });

      file.contents = Buffer.from(content);

      file.sourceMap = undefined;
    }
  });
};
