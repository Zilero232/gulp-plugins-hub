import type { PluginStream, Vinyl } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions, toPosixPath } from '@zilero/gulp-plugin-factory';
import { unique } from 'remeda';

import type { FontSwitcherOptions } from './font-switcher.schema';

import { getInputFormat, isFontFile, readSfnt, writeFormat } from './convert';
import { INPUT_EXTENSIONS, PLUGIN_NAME } from './font-switcher.constants';
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
export const fontSwitcher = (options: FontSwitcherOptions = {}): PluginStream => {
  const { formats, subset, hinting, keepOriginal } = parseOptions({
    name: PLUGIN_NAME,
    schema: fontSwitcherOptionsSchema,
    options
  });

  // Every path written so far, with the source it came from: `Inter.ttf` and `Inter.otf` would both write
  // `Inter.woff2`, and the second would silently replace the first in the output folder.
  const written = new Map<string, string>();

  const claim = (output: Vinyl, source: Vinyl): void => {
    const key = toPosixPath(output.relative);
    const previous = written.get(key);

    if (previous !== undefined) {
      throw new Error(`${toPosixPath(source.relative)} and ${previous} both write ${key}; rename one of them`);
    }

    written.set(key, toPosixPath(source.relative));
  };

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: INPUT_EXTENSIONS,
    filter: isFontFile,
    // SVG fonts are text, but plain ASCII: the check passes them.
    binary: true,
    transform: async (file) => {
      const input = getInputFormat(file.extname);

      // Narrows the format; `extensions` already let only fonts through.
      if (!input) {
        return;
      }

      const sfnt = await readSfnt({ contents: file.contents, format: input });
      const font = subset ? await subsetSfnt({ sfnt, subset, hinting }) : sfnt;

      // One file per path: with keepOriginal the source is emitted as it is instead of converting it to its own
      // format, unless it is subset, when the subset font takes that path.
      const requested = unique([formats].flat());
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

      for (const output of outputs) {
        claim(output, file);
      }

      return outputs;
    }
  });
};
