/** The containers fontverter converts between; `sfnt` is ttf or otf. */
type FontContainer = 'sfnt' | 'woff' | 'woff2';

/** fontverter ships no types: the part of its API the plugin uses. */
export type Fontverter = {
  /** Converts between the sfnt, woff and woff2 containers without touching the font's tables. */
  convert: (buffer: Buffer, toFormat: FontContainer) => Promise<Buffer>;
};

type SubsetFontOptions = {
  targetFormat?: FontContainer;
  /** Drop the hinting instructions. */
  noHinting?: boolean;
};

/** subset-font's own export; @types/subset-font lacks `noHinting`, which subset-font 2.9 supports. */
export type SubsetFont = (font: Buffer, text: string, options?: SubsetFontOptions) => Promise<Buffer>;
