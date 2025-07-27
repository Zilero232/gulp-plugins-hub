import type { MinifyOptions } from 'terser';

import { z } from 'zod';

// Schema for function.
const functionSchema = z.function().args(z.string()).returns(z.union([z.promise(z.string()), z.string()])).optional();

// Schema for minify options.
const minifyOptionsSchema = z.custom<MinifyOptions>();

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  logFinal: z.boolean().optional(),
  logProgress: z.boolean().optional(),
  onAfterMinify: functionSchema.optional(),
  onBeforeMinify: functionSchema.optional(),
});

// Main schema for plugin.
export const gulpJsSqueezerSchema = z.object({
  minifyOptions: minifyOptionsSchema.optional(),
  pluginOptions: pluginOptionsSchema.optional(),
}).strict();

// Export types.
export type GulpJsSqueezerOptions = z.infer<typeof gulpJsSqueezerSchema>;
