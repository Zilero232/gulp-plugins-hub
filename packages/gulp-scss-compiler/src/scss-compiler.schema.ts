import type { ContentHook } from '@zilero/gulp-plugin-factory';
import type { StringOptions } from 'sass-embedded';

import { isFunction, isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const hookSchema = z.custom<ContentHook>(isFunction, 'Expected a function');

/** Sass options the plugin sets itself from the file. */
type ManagedOption = 'sourceMap' | 'sourceMapIncludeSources' | 'syntax' | 'url';

export const scssCompilerOptionsSchema = z
  .object({
    /**
     * Passed to Sass: `style`, `loadPaths` (the file's base is always searched too), `importers`, `functions`,
     * `silenceDeprecations`, … Source maps follow `src(…, { sourcemaps: true })` instead of an option.
     */
    sassOptions: z.custom<Omit<StringOptions<'async'>, ManagedOption>>(isObject, 'Expected an object').optional(),
    /** Drop partials (`_variables.scss`) instead of compiling them on their own. Default true. */
    skipPartials: z.boolean().default(true),
    /** Runs on the source before Sass. */
    onBeforeCompile: hookSchema.optional(),
    /** Runs on the compiled CSS. Source maps do not follow changes made here. */
    onAfterCompile: hookSchema.optional()
  })
  .strict();

export type ScssCompilerOptions = z.input<typeof scssCompilerOptionsSchema>;
