import { BINARY_SNIFF_LENGTH } from '../text-replace.constants';

/** A NUL byte among the first bytes: the file is binary (image, font, archive) and is left alone. */
export const isBinary = (contents: Buffer): boolean => contents.subarray(0, BINARY_SNIFF_LENGTH).includes(0);
