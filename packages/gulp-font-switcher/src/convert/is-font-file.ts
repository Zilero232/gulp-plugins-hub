import type { Vinyl } from '@zilero/gulp-plugin-factory';

import { getInputFormat } from './get-input-format';

/**
 * Whether the plugin converts this file: a font extension, and for `.svg` an SVG font (a `<font>` element
 * inside, not only `<font-face>`) rather than an icon or an illustration, which pass through.
 */
export const isFontFile = (file: Vinyl): boolean => {
  const format = getInputFormat(file.extname);

  if (format !== 'svg') {
    return format !== undefined;
  }

  return file.isBuffer() && /<font[\s>]/.test(file.contents.toString());
};
