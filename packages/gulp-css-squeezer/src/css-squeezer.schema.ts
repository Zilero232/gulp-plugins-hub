import type { ContentHook } from '@zilero/gulp-plugin-factory';
import type { CustomAtRules, TransformOptions } from 'lightningcss';

import { isFunction, isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const hookSchema = z.custom<ContentHook>(isFunction, 'Expected a function');

/** Lightning CSS options the plugin sets itself. */
type ManagedOption = 'code' | 'filename' | 'inputSourceMap' | 'minify' | 'sourceMap' | 'targets';

export const cssSqueezerOptionsSchema = z
  .object({
    /**
     * The browsers to support, as a browserslist query: `'defaults'`, `['> 0.5%', 'not dead']`. Prefixes are added
     * and modern syntax is lowered for them. Default: the project's browserslist config (`.browserslistrc`, the
     * `browserslist` key of package.json) nearest to each file, else browserslist's defaults.
     */
    targets: z
      .union([z.string().min(1, 'Expected a browserslist query'), z.array(z.string().min(1)).min(1)])
      .optional(),
    /** Minify the output. Default true; false only prefixes and lowers syntax. */
    minify: z.boolean().default(true),
    /** Other Lightning CSS options: `drafts`, `nonStandard`, `errorRecovery`, `cssModules`, `visitor`, … */
    lightningcssOptions: z
      .custom<Omit<TransformOptions<CustomAtRules>, ManagedOption>>(isObject, 'Expected an object')
      .optional(),
    /** Runs on the source before Lightning CSS. */
    onBeforeMinify: hookSchema.optional(),
    /** Runs on the output. Source maps do not follow changes made here. */
    onAfterMinify: hookSchema.optional()
  })
  .strict();

export type CssSqueezerOptions = z.input<typeof cssSqueezerOptionsSchema>;
