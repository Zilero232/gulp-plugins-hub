import type { SubsetSfntInput } from './subset.types';

import { subsetFont } from '../vendor';

/** The text of a subset given as code points. */
const toText = (subset: string | number[]): string =>
  typeof subset === 'string' ? subset : subset.map((codePoint) => String.fromCodePoint(codePoint)).join('');

/**
 * The font with only the glyphs of the subset, cut by harfbuzz (`hb-subset`): the layout tables stay, so the
 * kept glyphs keep their ligatures, kerning and other OpenType features.
 */
export const subsetSfnt = async ({ sfnt, subset, hinting }: SubsetSfntInput): Promise<Buffer> =>
  subsetFont(sfnt, toText(subset), { targetFormat: 'sfnt', noHinting: !hinting });
