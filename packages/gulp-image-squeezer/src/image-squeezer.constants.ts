export const PLUGIN_NAME = '@zilero/gulp-image-squeezer';

/** The encoder each input extension uses when re-encoding in its own format; other files pass through. */
export const INPUT_FORMATS = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.webp': 'webp',
  '.avif': 'avif',
  '.gif': 'gif',
  '.tif': 'tiff',
  '.tiff': 'tiff'
} as const;

/** The extensions the plugin processes. */
export const INPUT_EXTENSIONS = Object.keys(INPUT_FORMATS);

export const OUTPUT_FORMATS = ['original', 'webp', 'avif', 'jpeg', 'png'] as const;

/** The extension of each encoder's output when it is not the original format. */
export const FORMAT_EXTENSIONS = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
  avif: '.avif',
  gif: '.gif',
  tiff: '.tif'
} as const;

/** Formats that hold an animation: frames are kept from one to another; any other output gets the first frame. */
export const ANIMATED_ENCODERS = ['gif', 'webp'];

/** JPEG has no transparency: transparent pixels become this color instead of black. */
export const JPEG_BACKGROUND = '#ffffff';

/**
 * Defaults tuned for the web: visually lossless, and AVIF at a moderate effort because it encodes slowly. PNG stays
 * lossless: sharp's `effort`, `quality` and `colors` switch it to a 256-color palette, which is opt-in
 * (`encoderOptions: { png: { palette: true } }`).
 */
export const DEFAULT_ENCODER_OPTIONS = {
  jpeg: { quality: 80, mozjpeg: true },
  png: { compressionLevel: 9, adaptiveFiltering: true },
  webp: { quality: 80, effort: 5 },
  avif: { quality: 55, effort: 4 },
  gif: { effort: 10 },
  tiff: { quality: 80 }
} as const;
