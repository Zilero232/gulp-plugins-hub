import type { Encoder, EncoderOptions, Quality } from '../../image-squeezer.types';

export type GetEncoderOptionsInput = {
  encoder: Encoder;
  quality: Quality | undefined;
  encoderOptions: EncoderOptions | undefined;
};

export type GetQualityInput = GetEncoderOptionsInput;
