import type { IsOutsideSizeRangeInput } from './rules.types';

/** Whether a known size is below `min` or above `max`. */
export const isOutsideSizeRange = ({ size, range }: IsOutsideSizeRangeInput): boolean => {
  if (size === undefined) {
    return false;
  }

  return (range.min !== undefined && size < range.min) || (range.max !== undefined && size > range.max);
};
