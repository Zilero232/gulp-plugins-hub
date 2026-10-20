import { unique } from 'remeda';

import type { PlanVariantsInput, Variant } from './variants.types';

/**
 * Every output of an image: each format at each width, in the order asked. The source's own format is written as
 * `original` (its extension kept, `keepSmaller` applied), once. Images are never enlarged: widths larger than the
 * image become one output at the image's own width, so every name tells the real width.
 */
export const planVariants = ({ formats, widths, sourceEncoder, sourceWidth }: PlanVariantsInput): Variant[] => {
  const kept = unique(formats.map((format) => (format === sourceEncoder ? 'original' : format)));
  const fitted = widths && unique(widths.map((width) => (sourceWidth ? Math.min(width, sourceWidth) : width)));

  return (fitted ?? [undefined]).flatMap((width) =>
    kept.map((format) => ({
      encoder: format === 'original' ? sourceEncoder : format,
      original: format === 'original',
      width
    }))
  );
};
