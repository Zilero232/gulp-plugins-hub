import type { Options } from 'pug';

import { z } from 'zod';

// Schema for function.
const functionSchema = z.function().args(z.string()).returns(z.union([z.promise(z.string()), z.string()])).optional();

// Schema for pug options.
const pugOptionsSchema = z.custom<Options>();

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  logFinal: z.boolean().optional(),
  logProgress: z.boolean().optional(),
  onAfterCompile: functionSchema.optional(),
  onBeforeCompile: functionSchema.optional(),
});

// Main schema for plugin.
export const gulpPugCompilerSchema = z.object({
  pugOptions: pugOptionsSchema.optional(),
  pluginOptions: pluginOptionsSchema.optional(),
}).strict();

// Export types.
export type GulpPugCompilerOptions = z.infer<typeof gulpPugCompilerSchema>;
