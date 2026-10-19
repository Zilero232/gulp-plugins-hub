import { isFunction, isRelativePathInside } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { BundleText } from './file-concat.types';

const bundleTextSchema = z.union([z.string(), z.custom<BundleText>(isFunction, 'Expected a string or a function')]);

export const fileConcatOptionsSchema = z
  .object({
    /** The result's path relative to the output folder: `app.js`, `vendor/bundle.css`. */
    name: z
      .string()
      .min(1, 'Expected a file name')
      .refine(isRelativePathInside, 'Expected a path inside the output folder'),
    /**
     * Globs that set the order, matched against the path relative to `file.base`: files matching the first glob
     * come first, then the second, …, then the rest. Gulp 5 does not keep the order of the globs given to `src`,
     * so use this when the order matters. Default: stream order.
     */
    order: z
      .union([
        z.string().min(1, 'Expected a glob'),
        z.array(z.string().min(1, 'Expected a glob')).min(1, 'Add at least one glob')
      ])
      .optional(),
    /** Put between two files. Default a line break. */
    separator: z.string().default('\n'),
    /** Added once at the start: a banner, `'use strict';`. */
    header: bundleTextSchema.optional(),
    /** Added once at the end. */
    footer: bundleTextSchema.optional()
  })
  .strict();

export type FileConcatOptions = z.input<typeof fileConcatOptionsSchema>;
