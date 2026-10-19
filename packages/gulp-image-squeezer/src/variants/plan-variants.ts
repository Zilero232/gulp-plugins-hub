import type { PlanVariantsInput, Variant } from './variants.types';

/**
 * Every output of an image: each format at each width, in the order asked. A format that is the source's own
 * and is also asked for as `original` would write the same file twice, so only `original` is kept.
 */
export const planVariants = ({ formats, widths, sourceEncoder }: PlanVariantsInput): Variant[] => {
  const hasOriginal = formats.includes('original');
  const kept = [...new Set(formats)].filter((format) => !(hasOriginal && format === sourceEncoder));

  return (widths ?? [undefined]).flatMap((width) =>
    kept.map((format) => ({
      encoder: format === 'original' ? sourceEncoder : format,
      original: format === 'original',
      width
    }))
  );
};
