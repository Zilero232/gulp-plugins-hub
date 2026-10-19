import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import { minify, presets } from 'html-minifier-next';

import type { HtmlSqueezerOptions } from './html-squeezer.schema';

import { HTML_EXTENSIONS, PLUGIN_NAME } from './html-squeezer.constants';
import { htmlSqueezerOptionsSchema } from './html-squeezer.schema';

/**
 * Minifies HTML (`.html`, `.htm`) with html-minifier-next, starting from one of its presets; other files pass
 * through.
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
    filter: (file) => HTML_EXTENSIONS.includes(file.extname.toLowerCase()),
    transform: async (file) => {
      let content = file.contents.toString();

      if (onBeforeMinify) {
        content = await onBeforeMinify({ content, file });
      }

      content = await minify(content, minifierOptions);

      if (onAfterMinify) {
        content = await onAfterMinify({ content, file });
      }

      file.contents = Buffer.from(content);
    }
  });
};
