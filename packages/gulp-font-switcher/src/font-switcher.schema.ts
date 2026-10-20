import { z } from 'zod';

import { MAX_CODE_POINT, OUTPUT_FORMATS } from './font-switcher.constants';

const formatSchema = z.enum(OUTPUT_FORMATS);

export const fontSwitcherOptionsSchema = z
  .object({
    /** One format or several: each font becomes one file per format. Default `['woff2']`. */
    formats: z.union([formatSchema, z.array(formatSchema).min(1, 'Add at least one format')]).default(['woff2']),
    /**
     * Keep only these glyphs, with harfbuzz: the characters of a string, or Unicode code points. Ligatures,
     * kerning and the other OpenType features of the kept glyphs stay. Default: every glyph.
     */
    subset: z
      .union([
        z.string().min(1, 'Expected the characters to keep'),
        z
          .array(z.number().int().min(0).max(MAX_CODE_POINT, 'Expected a Unicode code point'))
          .min(1, 'Add at least one code point')
      ])
      .optional(),
    /**
     * Keep the hinting instructions (sharper text on low-resolution screens) when subsetting and in the formats
     * that are rebuilt (ttf from CFF, eot, svg). woff2 and woff keep the font as it is. Default true.
     */
    hinting: z.boolean().default(true),
    /** Emit the source font as well as the converted ones. Default false. */
    keepOriginal: z.boolean().default(false)
  })
  .strict();

export type FontSwitcherOptions = z.input<typeof fontSwitcherOptionsSchema>;
