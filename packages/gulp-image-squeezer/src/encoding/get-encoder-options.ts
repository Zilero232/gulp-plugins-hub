import type { Encoder, EncoderOptions } from '../image-squeezer.types';
import type { GetEncoderOptionsInput, GetQualityInput } from './encoding.types';

import { DEFAULT_ENCODER_OPTIONS } from '../image-squeezer.constants';

/** PNG and GIF are lossless here: quality applies to the lossy encoders only. */
const getQuality = ({ encoder, quality }: GetQualityInput): number | undefined => {
  if (encoder === 'png' || encoder === 'gif') {
    return undefined;
  }

  return typeof quality === 'number' ? quality : quality?.[encoder];
};

/** The plugin's defaults, then the quality option, then the encoder options the user gave. */
export const getEncoderOptions = ({
  encoder,
  quality,
  encoderOptions
}: GetEncoderOptionsInput): EncoderOptions[Encoder] => {
  const qualityValue = getQuality({ encoder, quality });

  return {
    ...DEFAULT_ENCODER_OPTIONS[encoder],
    ...(qualityValue !== undefined && { quality: qualityValue }),
    ...encoderOptions?.[encoder]
  };
};
