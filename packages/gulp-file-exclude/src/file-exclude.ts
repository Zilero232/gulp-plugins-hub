import type { PluginStream, Vinyl } from '@zilero/gulp-plugin-factory';

import { createPathMatcher, createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';

import type { FileExcludeOptions } from './file-exclude.schema';

import { PLUGIN_NAME } from './file-exclude.constants';
import { fileExcludeOptionsSchema } from './file-exclude.schema';
import { getFileSize, isOutsideSizeRange } from './rules';

/**
 * Drops the files that match a glob or regular expression, fall outside a size range or that your own
 * predicate rejects. Every other file passes through untouched. With `invert`, only the matching files are kept.
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
    exclude,
    invert
  } = parseOptions({ name: PLUGIN_NAME, schema: fileExcludeOptionsSchema, options });

  const matchesPattern = createPathMatcher({ patterns: [patterns].flat() });

  const matches = async (file: Vinyl): Promise<boolean> =>
    matchesPattern(file.relative) ||
    (size !== undefined && isOutsideSizeRange({ size: getFileSize(file), range: size })) ||
    (exclude !== undefined && (await exclude({ file })));

  return createPlugin({
    name: PLUGIN_NAME,
    accept: 'any',
    // Dropped when a rule matches, or with `invert`, when none does.
    transform: async (file) => ((await matches(file)) === invert ? undefined : null)
  });
};
