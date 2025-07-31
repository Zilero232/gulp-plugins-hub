import type { Options } from 'sass-embedded';

import { z } from 'zod';

// Schema for scss options.
const scssOptionsSchema = z.custom<Options<'sync'>>();

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  onBeforeCompile: z.function().args(z.string()).returns(z.promise(z.string())).optional(),
  onAfterCompile: z.function().args(z.string()).returns(z.promise(z.string())).optional(),
});

// Main schema for plugin.
export const gulpScssSqueezerSchema = z.object({
  scssOptions: scssOptionsSchema.optional(),
  pluginOptions: pluginOptionsSchema.optional(),
}).strict();

export type GulpScssSqueezerOptions = z.infer<typeof gulpScssSqueezerSchema>;
