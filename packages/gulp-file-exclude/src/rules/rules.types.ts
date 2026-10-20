import type { SizeRange } from '../file-exclude.schema';

export type IsOutsideSizeRangeInput = {
  /** Bytes; undefined when unknown, which is never outside. */
  size: number | undefined;
  range: SizeRange;
};
