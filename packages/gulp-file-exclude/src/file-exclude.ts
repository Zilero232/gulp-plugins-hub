import type { PluginStream } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';

import type { FileExcludeOptions } from './file-exclude.schema';

import { PLUGIN_NAME } from './file-exclude.constants';
import { fileExcludeOptionsSchema } from './file-exclude.schema';
import { createPathMatcher, getFileSize, isOutsideSizeRange } from './rules';

/**
 * Drops the files that match a glob or regular expression, fall outside a size range or that your own
 * predicate rejects. Every other file passes through untouched.
 *
 * @example
 * src('src/**')
 *   .pipe(fileExclude({ patterns: ['*.map', 'drafts/**'], size: { max: 1024 * 1024 } }))
 *   .pipe(dest('dist'));
 */
export const fileExclude = (options: FileExcludeOptions): PluginStream => {
  const {
    patterns = [],
    size,
    exclude
  } = parseOptions({ name: PLUGIN_NAME, schema: fileExcludeOptionsSchema, options });
  const matchesPattern = createPathMatcher([patterns].flat());

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    transform: async (file) => {
      if (matchesPattern(file.relative)) {
        return null;
      }

      if (size && isOutsideSizeRange({ size: getFileSize(file), range: size })) {
        return null;
      }

      if (exclude && (await exclude({ file }))) {
        return null;
      }
    }
  });
};
