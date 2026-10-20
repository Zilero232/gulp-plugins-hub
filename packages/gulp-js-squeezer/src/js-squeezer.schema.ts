import type { ContentHook } from '@zilero/gulp-plugin-factory';
import type { MinifyOptions } from 'terser';

import { isFunction, isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

const hookSchema = z.custom<ContentHook>(isFunction, 'Expected a function');

export const jsSqueezerOptionsSchema = z
  .object({
    /**
     * Passed to terser's `minify`: `compress`, `mangle`, `format`, `module`, … `sourceMap` is set by the plugin.
     * Without `module`, `.mjs` files are minified as ES modules and `.js`, `.cjs` as scripts.
     */
    terserOptions: z.custom<Omit<MinifyOptions, 'sourceMap'>>(isObject, 'Expected an object').optional(),
    /** Runs on the source before terser. */
    onBeforeMinify: hookSchema.optional(),
    /** Runs on terser's output. The source map does not follow changes made here. */
    onAfterMinify: hookSchema.optional()
  })
  .strict();

export type JsSqueezerOptions = z.input<typeof jsSqueezerOptionsSchema>;
