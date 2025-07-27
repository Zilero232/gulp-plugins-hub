import { z } from 'zod';

import { fileVinylSchema } from '@/shared/schemas';

// Schema for patterns.
const patternsSchema = z.union([z.string(), z.instanceof(RegExp)]);

// Schema for plugin.
export const gulpFileExcludeSchema = z.object({
  patterns: z.array(patternsSchema).optional(),
  logExcluded: z.boolean().optional(),
  size: z.array(z.number().optional(), z.number().optional()).optional(),
  onExclude: z.function().args(fileVinylSchema).returns(z.promise(z.boolean())).optional()
}).strict();

// Export types.
export type GulpFileExcludeOptions = z.infer<typeof gulpFileExcludeSchema>;
