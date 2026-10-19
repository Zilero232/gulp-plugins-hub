import type { AvifOptions, GifOptions, JpegOptions, PngOptions, TiffOptions, WebpOptions } from 'sharp';

import type { FORMAT_EXTENSIONS, OUTPUT_FORMATS } from './image-squeezer.constants';

/** An encoder sharp writes with. */
export type Encoder = keyof typeof FORMAT_EXTENSIONS;

/** What to write: `original` re-encodes in the source's own format. */
export type ImageFormat = (typeof OUTPUT_FORMATS)[number];

/** Quality from 1 to 100 for every lossy encoder, or per encoder. */
export type Quality = number | Partial<Record<'avif' | 'jpeg' | 'tiff' | 'webp', number>>;

/** sharp options per encoder, merged over the plugin's defaults. */
export type EncoderOptions = {
  jpeg?: JpegOptions;
  png?: PngOptions;
  webp?: WebpOptions;
  avif?: AvifOptions;
  gif?: GifOptions;
  tiff?: TiffOptions;
};
