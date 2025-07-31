import type { GlyphPluginOptions } from '../types';

import { z } from 'zod';

// Supported font types.
const fontTypesSchema = z.enum(['ttf', 'woff', 'woff2', 'eot', 'svg']);

// Schema for font options.
const fontOptionsSchema = z.object({
  glyph: z.custom<GlyphPluginOptions>().optional(),
});

// Schema for plugin options.
const pluginOptionsSchema = z.object({
  format: fontTypesSchema,
});

// Main schema for plugin options.
export const gulpFontSwitcherSchema = z.object({
  fontOptions: fontOptionsSchema.optional(),
  pluginOptions: pluginOptionsSchema
});

// Type for plugin options.
export type GulpFontSwitcherOptions = z.infer<typeof gulpFontSwitcherSchema>;
export type fontType = z.infer<typeof fontTypesSchema>;
