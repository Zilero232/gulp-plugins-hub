import type { PluginStream, Vinyl } from '@zilero/gulp-plugin-factory';

import { assertBinaryContents, createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';

import type { FontSwitcherOptions } from './font-switcher.schema';

import { getInputFormat, isFontFile, readSfnt, writeFormat } from './convert';
import { PLUGIN_NAME } from './font-switcher.constants';
import { fontSwitcherOptionsSchema } from './font-switcher.schema';
import { subsetSfnt } from './subset';

/**
 * Converts fonts (`.ttf`, `.otf`, `.woff`, `.woff2`, `.eot`, SVG fonts) into one or more formats, optionally keeping
 * only the glyphs you use. woff2, woff and ttf keep every table of the font; subsetting is done by harfbuzz.
 * Other files, SVG images included, pass through. WebAssembly only: nothing to compile on install.
 *
 * Read fonts with `encoding: false`: gulp 5 reads files as UTF-8 by default, which corrupts binary data.
 *
 * @example
 * src('src/fonts/*.{ttf,otf}', { encoding: false })
 *   .pipe(fontSwitcher({ formats: ['woff2', 'woff'], subset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }))
 *   .pipe(dest('dist/fonts'));
 */
export const fontSwitcher = (options: FontSwitcherOptions): PluginStream => {
  const { formats, subset, hinting, keepOriginal } = parseOptions({
    name: PLUGIN_NAME,
    schema: fontSwitcherOptionsSchema,
    options
  });

  return createPlugin({
    name: PLUGIN_NAME,
    filter: isFontFile,
    transform: async (file) => {
      const input = getInputFormat(file.extname);

      // Narrows the format; the filter already let only fonts through.
      if (!input) {
        return;
      }

      if (input !== 'svg') {
        assertBinaryContents(file);
      }

      const sfnt = await readSfnt({ contents: file.contents, format: input });
      const font = subset ? await subsetSfnt({ sfnt, subset, hinting }) : sfnt;

      // One file per path: with keepOriginal the source is emitted as it is instead of converting it to its own
      // format, unless it is subset, when the subset font takes that path.
      const requested = [...new Set([formats].flat())];
      const requestsOwnFormat = new Set<string>(requested).has(input);
      const emitsOriginal = keepOriginal && !(subset && requestsOwnFormat);
      const targets = requested.filter((format) => !(emitsOriginal && format === input));
      const outputs: Vinyl[] = emitsOriginal ? [file] : [];

      for (const format of targets) {
        const output = file.clone({ deep: true, contents: false });

        output.contents = await writeFormat({ sfnt: font, format, hinting });
        output.extname = `.${format}`;
        outputs.push(output);
      }

      return outputs;
    }
  });
};
