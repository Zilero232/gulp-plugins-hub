import { isNumber } from 'remeda';

import type { Encoder, EncoderOptions } from '../../image-squeezer.types';
import type { GetEncoderOptionsInput, GetQualityInput } from './get-encoder-options.types';

import { DEFAULT_ENCODER_OPTIONS } from '../../image-squeezer.constants';

/** GIF is lossless and PNG is unless quantized to a palette: quality applies to the lossy encoders only. */
const getQuality = ({ encoder, quality, encoderOptions }: GetQualityInput): number | undefined => {
  if (encoder === 'gif' || (encoder === 'png' && encoderOptions?.png?.palette !== true)) {
    return undefined;
  }

  return isNumber(quality) ? quality : quality?.[encoder];
};

/** The plugin's defaults, then the quality option, then the encoder options the user gave. */
export const getEncoderOptions = ({
  encoder,
  quality,
  encoderOptions
}: GetEncoderOptionsInput): EncoderOptions[Encoder] => {
  const qualityValue = getQuality({ encoder, quality, encoderOptions });

  return {
    ...DEFAULT_ENCODER_OPTIONS[encoder],
    ...(qualityValue !== undefined && { quality: qualityValue }),
    ...encoderOptions?.[encoder]
  };
};
