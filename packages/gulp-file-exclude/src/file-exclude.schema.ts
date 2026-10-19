import { isFunction } from '@zilero/gulp-plugin-factory';
import path from 'node:path';
import { z } from 'zod';

import type { ExcludePredicate } from './file-exclude.types';

const globSchema = z
  .string()
  .min(1, 'Expected a glob')
  .refine((glob) => !glob.startsWith('!'), 'Negated globs are not supported: list what to drop')
  .refine((glob) => !glob.includes('\\'), 'Expected / in globs, not \\')
  .refine((glob) => !path.isAbsolute(glob), 'Expected a glob relative to file.base, not an absolute path');

const patternSchema = z.union([globSchema, z.instanceof(RegExp)], 'Expected a glob or a RegExp');

const sizeSchema = z
  .object({
    /** Files smaller than this many bytes are dropped. */
    min: z.number().int().nonnegative().optional(),
    /** Files larger than this many bytes are dropped. */
    max: z.number().int().nonnegative().optional()
  })
  .strict()
  .refine(({ min, max }) => min === undefined || max === undefined || min <= max, 'min must not be greater than max');

export const fileExcludeOptionsSchema = z
  .object({
    /**
     * Globs (picomatch) or regular expressions matched against the path relative to `file.base`, with `/`
     * separators. A glob without a slash matches the file name in any directory: `*.map` drops every source map.
     */
    patterns: z.union([patternSchema, z.array(patternSchema).min(1, 'Add at least one pattern')]).optional(),
    /** Drops files outside this size range, in bytes. */
    size: sizeSchema.optional(),
    /** Your own check, after patterns and size: return true to drop the file. */
    exclude: z.custom<ExcludePredicate>(isFunction, 'Expected a function').optional()
  })
  .strict()
  .refine(
    ({ patterns, size, exclude }) => patterns !== undefined || size !== undefined || exclude !== undefined,
    'Set at least one of patterns, size or exclude'
  );

export type FileExcludeOptions = z.input<typeof fileExcludeOptionsSchema>;
