import type { Vinyl } from '@zilero/gulp-plugin-factory';

import sharp from 'sharp';

import type { EncodeVariantInput } from './encode-variant.types';

import { ANIMATED_ENCODERS, FORMAT_EXTENSIONS, JPEG_BACKGROUND } from '../../image-squeezer.constants';
import { getEncoderOptions } from '../get-encoder-options';

/**
 * Writes one output of an image as a copy of the file. Photos are turned upright from their EXIF orientation.
 * Animations keep their frames from GIF or WebP to GIF or WebP, and multi-page TIFFs their pages from TIFF to TIFF;
 * any other output gets the first page. Transparency becomes white in JPEG, which has none.
 */
export const encodeVariant = async ({
  file,
  variant,
  sourceEncoder,
  quality,
  encoderOptions,
  keepSmaller
}: EncodeVariantInput): Promise<Vinyl> => {
  const keepsPages =
    (ANIMATED_ENCODERS.includes(sourceEncoder) && ANIMATED_ENCODERS.includes(variant.encoder)) ||
    (sourceEncoder === 'tiff' && variant.encoder === 'tiff');

  const image = sharp(file.contents, { autoOrient: true, pages: keepsPages ? -1 : 1 });

  if (variant.width) {
    image.resize({ width: variant.width, withoutEnlargement: true });
  }

  if (variant.encoder === 'jpeg') {
    image.flatten({ background: JPEG_BACKGROUND });
  }

  const encoded = await image
    .toFormat(variant.encoder, getEncoderOptions({ encoder: variant.encoder, quality, encoderOptions }))
    .toBuffer();

  const isBigger = variant.original && !variant.width && encoded.length >= file.contents.length;
  const output = file.clone({ deep: true, contents: false });

  output.contents = keepSmaller && isBigger ? file.contents : encoded;
  output.stem = variant.width ? `${file.stem}-${variant.width}w` : file.stem;
  output.extname = variant.original ? file.extname : FORMAT_EXTENSIONS[variant.encoder];

  return output;
};
