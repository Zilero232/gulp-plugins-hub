import Fontmin from 'fontmin';

import type { fontType } from '../schema';

export const convertFont = async (fontmin: Fontmin, sourceFormat: string, targetFormat: fontType): Promise<Fontmin> => {
  // If the source format is OTF and the target format is not TTF.
  if (sourceFormat === 'otf' && targetFormat !== 'ttf') {
    // First convert to TTF.
    fontmin.use(Fontmin.otf2ttf());
  }

  // Add the necessary conversions.
  switch (targetFormat) {
    case 'ttf':
      if (sourceFormat === 'otf') {
        fontmin.use(Fontmin.otf2ttf());
      }

      if (sourceFormat === 'svg') {
        fontmin.use(Fontmin.svg2ttf());
      }
      break;
    case 'eot':
      fontmin.use(Fontmin.ttf2eot());
      break;
    case 'woff':
      fontmin.use(Fontmin.ttf2woff());
      break;
    case 'woff2':
      fontmin.use(Fontmin.ttf2woff2());
      break;
    case 'svg':
      fontmin.use(Fontmin.ttf2svg());
      break;
  }

  return fontmin;
};
