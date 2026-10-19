import { isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import type { EncoderOptions } from './image-squeezer.types';

import { OUTPUT_FORMATS } from './image-squeezer.constants';

const formatSchema = z.enum(OUTPUT_FORMATS);
const qualitySchema = z.number().int().min(1).max(100);

export const imageSqueezerOptionsSchema = z
  .object({
    /** One format or several; every image becomes one file per format (and width). Default `original`. */
    formats: z.union([formatSchema, z.array(formatSchema).min(1, 'Add at least one format')]).default('original'),
    /**
     * Widths in pixels for responsive images: `hero.jpg` becomes `hero-640w.jpg`, `hero-1280w.jpg`, … Images
     * are never enlarged. Default: keep the size and the name.
     */
    widths: z.array(z.number().int().positive()).min(1, 'Add at least one width').optional(),
    /** Quality from 1 to 100 for every lossy encoder, or per encoder: `{ webp: 75, avif: 50 }`. */
    quality: z
      .union([
        qualitySchema,
        z
          .object({ jpeg: qualitySchema, webp: qualitySchema, avif: qualitySchema, tiff: qualitySchema })
          .partial()
          .strict()
      ])
      .optional(),
    /** sharp options per encoder (`mozjpeg`, `effort`, `lossless`, `palette`, …), over the defaults. */
    encoderOptions: z.custom<EncoderOptions>(isObject, 'Expected an object').optional(),
    /** Keep the source when re-encoding it in its own format made it bigger. Default true. */
    keepSmaller: z.boolean().default(true)
  })
  .strict();

export type ImageSqueezerOptions = z.input<typeof imageSqueezerOptionsSchema>;
