import { isFunction } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { CompareFunction, DestResolver, TargetResolver } from './file-changed.types';

import { COMPARE_MODES } from './file-changed.constants';

export const fileChangedOptionsSchema = z
  .object({
    /** The folder `dest` writes to: the same value, or a function of the file. */
    dest: z.union([z.string().min(1), z.custom<DestResolver>(isFunction, 'Expected a string or a function')]),
    /** The extension the built file has, when the build changes it: `.css` for `.scss` sources. */
    extname: z
      .string()
      .regex(/^\.\w[\w.-]*$/, 'Expected an extension with its dot, like .css')
      .optional(),
    /**
     * The built file's path relative to `dest`, when the build renames files in other ways:
     * `({ file }) => \`images/${file.stem}-1280w.jpg\``. Wins over `extname`.
     */
    target: z.custom<TargetResolver>(isFunction, 'Expected a function').optional(),
    /**
     * How a file counts as changed: `mtime` (newer than the built file, the default), `contents` (different
     * bytes, for builds that copy files as they are) or a function.
     */
    compare: z
      .union([z.enum(COMPARE_MODES), z.custom<CompareFunction>(isFunction, 'Expected a mode or a function')])
      .default('mtime')
  })
  .strict();

export type FileChangedOptions = z.input<typeof fileChangedOptionsSchema>;
