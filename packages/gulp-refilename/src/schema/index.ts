import { z } from 'zod';

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  dirname: z.string().optional(),
  stem: z.string().optional(),
  extname: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
}).strict();

// Main schema for plugin.
export const gulpRefilenameSchema = pluginOptionsSchema;

// Export types.
export type GulpRefilenameOptions = z.infer<typeof gulpRefilenameSchema>;
