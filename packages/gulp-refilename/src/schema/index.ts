import { z } from 'zod';

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  basename: z.string().optional(),
  dirname: z.string().optional(),
  extname: z.string().optional(),
  multiExt: z.boolean().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
}).strict();

// Main schema for plugin.
export const gulpRefilenameSchema = z.union([z.string(), pluginOptionsSchema]).optional();

// Export types.
export type GulpRefilenameOptions = z.infer<typeof gulpRefilenameSchema>;
