import type { ContentHook } from '@zilero/gulp-plugin-factory';
import type { Options } from 'pug';

import { isFunction, isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { TemplateData, TemplateDataFunction } from './pug-compiler.types';

const hookSchema = z.custom<ContentHook>(isFunction, 'Expected a function');

export const pugCompilerOptionsSchema = z
  .object({
    /** Passed to pug: `pretty`, `doctype`, `filters`, `basedir` (default `file.base`, for absolute includes)… */
    pugOptions: z.custom<Omit<Options, 'filename'>>(isObject, 'Expected an object').optional(),
    /**
     * Locals for every template, or a function that returns them for each file. Merged over `file.data` (set by
     * gulp-data or a front-matter plugin): these win.
     */
    data: z
      .union(
        [z.custom<TemplateData>(isObject), z.custom<TemplateDataFunction>(isFunction)],
        'Expected an object or a function'
      )
      .optional(),
    /** The extension of the output. Default `.html`. */
    extname: z
      .string()
      .regex(/^\.\w[\w.-]*$/, 'Expected an extension with its dot, like .html')
      .default('.html'),
    /**
     * Drop partials instead of rendering them: files whose name, or the name of a folder they are in (relative to
     * the base), starts with `_` (`_layout.pug`, `_includes/nav.pug`). Default true.
     */
    skipPartials: z.boolean().default(true),
    /** Runs on the template source before pug. */
    onBeforeCompile: hookSchema.optional(),
    /** Runs on the rendered HTML, once the file has its new extension. */
    onAfterCompile: hookSchema.optional()
  })
  .strict();

export type PugCompilerOptions = z.input<typeof pugCompilerOptionsSchema>;
