import type { AvifOptions, GifOptions, JpegOptions, PngOptions, TiffOptions, WebpOptions } from 'sharp';

import { isObject } from '@zilero/gulp-plugin-factory';
import { z } from 'zod';

import { OUTPUT_FORMATS } from './image-squeezer.constants';

const formatSchema = z.enum(OUTPUT_FORMATS);
const qualityValueSchema = z.number().int().min(1).max(100);

export const qualitySchema = z.union([
  qualityValueSchema,
  z
    .object({
      jpeg: qualityValueSchema,
      webp: qualityValueSchema,
      avif: qualityValueSchema,
      tiff: qualityValueSchema,
      /** Applies only when `encoderOptions.png.palette` is true: PNG is lossless otherwise. */
      png: qualityValueSchema
    })
    .partial()
    .strict()
]);

const encoderObject = 'Expected an object of sharp options';

export const encoderOptionsSchema = z
  .object({
    jpeg: z.custom<JpegOptions>(isObject, encoderObject),
    png: z.custom<PngOptions>(isObject, encoderObject),
    webp: z.custom<WebpOptions>(isObject, encoderObject),
    avif: z.custom<AvifOptions>(isObject, encoderObject),
    gif: z.custom<GifOptions>(isObject, encoderObject),
    tiff: z.custom<TiffOptions>(isObject, encoderObject)
  })
  .partial()
  .strict();

export const imageSqueezerOptionsSchema = z
  .object({
    /**
     * One format or several; every image becomes one file per format (and width). The source's own format is the
     * same as `original`. Default `original`.
     */
    formats: z.union([formatSchema, z.array(formatSchema).min(1, 'Add at least one format')]).default('original'),
    /**
     * Widths in pixels for responsive images: `hero.jpg` becomes `hero-640w.jpg`, `hero-1280w.jpg`, … Images are
     * never enlarged: widths larger than the image become one file at the image's own width. Default: keep the
     * size and the name.
     */
    widths: z.array(z.number().int().positive()).min(1, 'Add at least one width').optional(),
    /**
     * Quality from 1 to 100 for every lossy encoder, or per encoder: `{ webp: 75, avif: 50 }`. PNG takes it only
     * with `encoderOptions.png.palette`.
     */
    quality: qualitySchema.optional(),
    /** sharp options per encoder (`jpeg`, `png`, `webp`, `avif`, `gif`, `tiff`), over the defaults. */
    encoderOptions: encoderOptionsSchema.optional(),
    /** Keep the source when re-encoding it in its own format made it bigger. Default true. */
    keepSmaller: z.boolean().default(true)
  })
  .strict();

export type ImageSqueezerOptions = z.input<typeof imageSqueezerOptionsSchema>;
