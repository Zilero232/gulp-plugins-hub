import type { BufferFile, PluginStream } from '@zilero/gulp-plugin-factory';

import { applySourceMap, createPlugin, parseOptions, Vinyl } from '@zilero/gulp-plugin-factory';
import path from 'node:path';

import type { FileConcatOptions } from './file-concat.schema';

import { createBundle, createBundleMap, getNewestStat, toBundleSources } from './bundle';
import { PLUGIN_NAME } from './file-concat.constants';
import { fileConcatOptionsSchema } from './file-concat.schema';
import { sortByGlobs } from './order';

/**
 * Joins every file of the stream, in stream order or the one `order` sets, into one file named relative to the
 * base of the first one. When the inputs have source maps, the result gets one that points at every input's
 * original sources.
 *
 * @example
 * src('src/js/**\/*.js', { sourcemaps: true })
 *   .pipe(fileConcat({ name: 'bundle.js', order: ['vendor/**', '**'], separator: ';\n' }))
 *   .pipe(dest('dist/js', { sourcemaps: '.' }));
 */
export const fileConcat = (options: FileConcatOptions): PluginStream => {
  const { name, order, separator, header, footer } = parseOptions({
    name: PLUGIN_NAME,
    schema: fileConcatOptionsSchema,
    options
  });

  const files: BufferFile[] = [];

  return createPlugin({
    name: PLUGIN_NAME,
    transform: (file) => {
      files.push(file);

      return null;
    },
    flush: async ({ push }) => {
      const [first] = files;

      if (!first) {
        return;
      }

      const ordered = order ? sortByGlobs({ files, order: [order].flat() }) : files;
      const sources = toBundleSources({ files: ordered, base: first.base });
      const bundle = await createBundle({ sources, separator, header, footer });

      const output = new Vinyl({
        cwd: first.cwd,
        base: first.base,
        path: path.join(first.base, name),
        contents: Buffer.from(bundle.toString()),
        stat: getNewestStat(files)
      });

      if (files.some((file) => file.sourceMap)) {
        applySourceMap({ file: output, map: createBundleMap({ bundle, sources }) });
      }

      push(output);
    }
  });
};
