import type { Encoder, ImageFormat } from '../image-squeezer.types';

/** One output of an image: an encoder, at a width or the source size. */
export type Variant = {
  encoder: Encoder;
  /** Re-encoded in the source's own format, keeping its extension. */
  original: boolean;
  width?: number;
};

export type PlanVariantsInput = {
  formats: ImageFormat[];
  widths: number[] | undefined;
  /** The encoder of the source's own format. */
  sourceEncoder: Encoder;
};
