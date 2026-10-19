export const PLUGIN_NAME = '@zilero/gulp-font-switcher';

/** Formats the plugin writes. */
export const OUTPUT_FORMATS = ['woff2', 'woff', 'ttf', 'eot', 'svg'] as const;

/** Formats the plugin reads, by extension; other files pass through. */
export const INPUT_FORMATS = {
  '.ttf': 'ttf',
  '.otf': 'otf',
  '.woff': 'woff',
  '.woff2': 'woff2',
  '.eot': 'eot',
  '.svg': 'svg'
} as const;

/** The highest Unicode code point, U+10FFFF. */
export const MAX_CODE_POINT = 1_114_111;

/** The first bytes of an sfnt font with CFF (PostScript) outlines; TrueType fonts start otherwise. */
export const CFF_SIGNATURE = 'OTTO';
