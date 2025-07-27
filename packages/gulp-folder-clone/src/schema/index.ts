import { z } from 'zod';

import { fileVinylSchema } from '@/shared/schemas';

// Schema for plugin options.
export const gulpFolderCloneSchema = z.object({
  logProgress: z.boolean().optional(),
  logFinish: z.boolean().optional(),
  onBeforeCopy: z.function().args(fileVinylSchema).returns(z.union([z.promise(fileVinylSchema), fileVinylSchema])).optional(),
}).strict();

// Export types.
export type GulpFolderCloneOptions = z.infer<typeof gulpFolderCloneSchema>;
