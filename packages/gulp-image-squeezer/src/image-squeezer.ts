import type { PluginStream, Vinyl } from '@zilero/gulp-plugin-factory';

import { createPlugin, parseOptions } from '@zilero/gulp-plugin-factory';
import sharp from 'sharp';

import type { ImageSqueezerOptions } from './image-squeezer.schema';

import { encodeVariant, getSourceEncoder } from './encoding';
import { INPUT_EXTENSIONS, PLUGIN_NAME } from './image-squeezer.constants';
import { imageSqueezerOptionsSchema } from './image-squeezer.schema';
import { planVariants } from './variants';

/**
 * Optimizes images (`.jpg`, `.png`, `.webp`, `.avif`, `.gif`, `.tiff`) with sharp, converts them to other formats
 * and resizes them for `srcset`. Photos are turned upright from their EXIF orientation. SVG and other files pass
 * through.
 *
 * Read images with `encoding: false`: gulp 5 reads files as UTF-8 by default, which corrupts binary data.
 *
 * @example
 * src('src/images/**', { encoding: false })
 *   .pipe(imageSqueezer({ formats: ['original', 'webp', 'avif'], widths: [640, 1280] }))
 *   .pipe(dest('dist/images'));
 */
export const imageSqueezer = (options: ImageSqueezerOptions = {}): PluginStream => {
  const { formats, widths, quality, encoderOptions, keepSmaller } = parseOptions({
    name: PLUGIN_NAME,
    schema: imageSqueezerOptionsSchema,
    options
  });

  return createPlugin({
    name: PLUGIN_NAME,
    extensions: INPUT_EXTENSIONS,
    binary: true,
    transform: async (file) => {
      const sourceEncoder = getSourceEncoder(file.extname);

      // Narrows the encoder; `extensions` already let only images through.
      if (!sourceEncoder) {
        return;
      }

      // The upright width caps the widths; read only when widths are asked for.
      const sourceWidth = widths && (await sharp(file.contents).metadata()).autoOrient.width;
      const variants = planVariants({ formats: [formats].flat(), widths, sourceEncoder, sourceWidth });
      const outputs: Vinyl[] = [];

      for (const variant of variants) {
        outputs.push(await encodeVariant({ file, variant, sourceEncoder, quality, encoderOptions, keepSmaller }));
      }

      return outputs;
    }
  });
};
