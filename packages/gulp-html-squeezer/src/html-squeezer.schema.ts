import type { ContentHook } from '@zilero/gulp-plugin-factory';
import type { MinifierOptions } from 'html-minifier-next';

import { isFunction, isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import { PRESET_NAMES } from './html-squeezer.constants';

const hookSchema = z.custom<ContentHook>(isFunction, 'Expected a function');

export const htmlSqueezerOptionsSchema = z
  .object({
    /**
     * The html-minifier-next preset to start from: `conservative` (safe for any page), `comprehensive` (smallest
     * output, also minifies inline CSS, JavaScript and SVG) or `false` for none. Default `conservative`.
     */
    preset: z.union([z.enum(PRESET_NAMES), z.literal(false)]).default('conservative'),
    /** html-minifier-next options, applied over the preset. */
    htmlMinifierOptions: z.custom<MinifierOptions>(isObject, 'Expected an object').optional(),
    /** Runs on the markup before minification. */
    onBeforeMinify: hookSchema.optional(),
    /** Runs on the minified markup. */
    onAfterMinify: hookSchema.optional()
  })
  .strict();

export type HtmlSqueezerOptions = z.input<typeof htmlSqueezerOptionsSchema>;
