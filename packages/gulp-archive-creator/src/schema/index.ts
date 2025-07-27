import type { ArchiverOptions, Format } from 'archiver';

import { z } from 'zod';

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  archiveName: z.string(),
  createDirectory: z.boolean().optional(),
  createEmptyArchive: z.boolean().optional(),
  logFinal: z.boolean().optional(),
  logProgress: z.boolean().optional(),
});

// Main schema for plugin.
export const gulpArchiveCreatorSchema = z.object({
  format: z.custom<Format>(),
  archiveOptions: z.custom<ArchiverOptions>().optional(),
  pluginOptions: pluginOptionsSchema.optional(),
}).strict();

// Export types.
export type GulpArchiveCreatorOptions = z.infer<typeof gulpArchiveCreatorSchema>;
