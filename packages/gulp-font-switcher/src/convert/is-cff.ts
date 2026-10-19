import { CFF_SIGNATURE } from '../font-switcher.constants';

/** Whether an sfnt font has CFF (PostScript) outlines, an `.otf`, rather than TrueType ones. */
export const isCff = (sfnt: Buffer): boolean => sfnt.toString('latin1', 0, 4) === CFF_SIGNATURE;
