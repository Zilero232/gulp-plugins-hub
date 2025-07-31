import type { Options } from 'html-minifier-terser';

import { z } from 'zod';

// Schema for function.
const functionSchema = z.function().args(z.string()).returns(z.union([z.promise(z.string()), z.string()])).optional();

// Schema for html minifier options.
const htmlMinifierOptionsSchema = z.custom<Options>();

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  onAfterMinify: functionSchema.optional(),
  onBeforeMinify: functionSchema.optional(),
});

// Main schema for plugin.
export const gulpHtmlSqueezerSchema = z.object({
  htmlMinifierOptions: htmlMinifierOptionsSchema.optional(),
  pluginOptions: pluginOptionsSchema.optional(),
}).strict();

// Export types.
export type GulpHtmlSqueezerOptions = z.infer<typeof gulpHtmlSqueezerSchema>;
