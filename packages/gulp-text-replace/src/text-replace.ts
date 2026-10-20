import type { PluginStream, SourceMap } from '@zilero/gulp-plugin-factory';

import remapping from '@jridgewell/remapping';
import { applySourceMap, createPlugin, parseOptions, toPosixPath } from '@zilero/gulp-plugin-factory';
import MagicString from 'magic-string';

import type { TextReplaceOptions } from './text-replace.schema';

import { isBinary } from './binary';
import { resolveFileText } from './file-text';
import { replaceMatches } from './replace';
import { BOM, PLUGIN_NAME } from './text-replace.constants';
import { textReplaceOptionsSchema } from './text-replace.schema';

/**
 * Replaces text in every file with strings or regular expressions, then adds an optional header and footer.
 * Replacers can be async and see the match, its groups and the file. Source maps follow every change. Binary
 * files pass through untouched.
 *
 * @example
 * src('dist/**\/*.{html,js}')
 *   .pipe(textReplace({
 *     rules: [
 *       { search: '__VERSION__', replace: pkg.version },
 *       { search: /https?:\/\/localhost:\d+/g, replace: 'https://example.com' }
 *     ],
 *     header: ({ file }) => `/*! ${file.relative} | MIT *\/\n`
 *   }))
 *   .pipe(dest('dist'));
 */
export const textReplace = (options: TextReplaceOptions): PluginStream => {
  const {
    rules = [],
    header,
    footer,
    skipBinary
  } = parseOptions({
    name: PLUGIN_NAME,
    schema: textReplaceOptionsSchema,
    options
  });

  const ruleList = [rules].flat();

  return createPlugin({
    name: PLUGIN_NAME,
    filter: (file) => !(skipBinary && file.isBuffer() && isBinary(file.contents)),
    transform: async (file) => {
      const source = toPosixPath(file.relative);
      // One map per step, the last first: rules apply to the result of the rule before them. Built only when
      // the file has a map: high-resolution maps are costly on large files.
      const maps: string[] = [];
      let content = file.contents.toString();

      for (const rule of ruleList) {
        const magic = new MagicString(content);

        await replaceMatches({ magic, content, rule, file });

        if (file.sourceMap) {
          maps.unshift(magic.generateMap({ source, hires: true }).toString());
        }

        content = magic.toString();
      }

      const magic = new MagicString(content);

      // After a byte order mark: it must stay the first character for editors and parsers to see it.
      magic.prependLeft(
        content.startsWith(BOM) ? BOM.length : 0,
        await resolveFileText({ name: 'header', text: header, file })
      );

      magic.append(await resolveFileText({ name: 'footer', text: footer, file }));

      if (file.sourceMap) {
        maps.unshift(magic.generateMap({ source, hires: true }).toString());
      }

      file.contents = Buffer.from(magic.toString());

      if (file.sourceMap) {
        const map: SourceMap = JSON.parse(JSON.stringify(remapping(maps, () => null)));

        applySourceMap({ file, map, chain: true });
      }
    }
  });
};
