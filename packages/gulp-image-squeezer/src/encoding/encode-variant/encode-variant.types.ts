import type { BufferFile } from '@zilero/gulp-plugin-factory';

import type { Encoder, EncoderOptions, Quality } from '../../image-squeezer.types';
import type { Variant } from '../../variants';

export type EncodeVariantInput = {
  file: BufferFile;
  variant: Variant;
  /** The encoder of the source's own format, which decides whether its pages or frames can be kept. */
  sourceEncoder: Encoder;
  quality: Quality | undefined;
  encoderOptions: EncoderOptions | undefined;
  /** Keep the source's bytes when re-encoding it in its own format at its size made it bigger. */
  keepSmaller: boolean;
};
