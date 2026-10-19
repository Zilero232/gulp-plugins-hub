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
    /** Locals for every template, or a function that returns them for each file. */
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
    /** Drop files whose name starts with `_` (layouts, mixins, includes) instead of rendering them. Default true. */
    skipPartials: z.boolean().default(true),
    /** Runs on the template source before pug. */
    onBeforeCompile: hookSchema.optional(),
    /** Runs on the rendered HTML. */
    onAfterCompile: hookSchema.optional()
  })
  .strict();

export type PugCompilerOptions = z.input<typeof pugCompilerOptionsSchema>;
