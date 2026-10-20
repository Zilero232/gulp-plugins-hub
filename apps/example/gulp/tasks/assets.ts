import type { ImageFormat } from '@zilero/gulp-image-squeezer';
import type { Vinyl } from '@zilero/gulp-plugin-factory';

import conditional from '@zilero/gulp-conditional';
import fileChanged from '@zilero/gulp-file-changed';
import fileExclude from '@zilero/gulp-file-exclude';
import folderClone from '@zilero/gulp-folder-clone';
import fontSwitcher from '@zilero/gulp-font-switcher';
import imageSqueezer from '@zilero/gulp-image-squeezer';
import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { paths, production } from '../config.ts';

const isImage = (file: Vinyl): boolean => ['.jpeg', '.jpg', '.png'].includes(file.extname.toLowerCase());
const isFont = (file: Vinyl): boolean => ['.otf', '.ttf'].includes(file.extname.toLowerCase());
const isHero = (file: Vinyl): boolean => isImage(file) && file.stem === 'hero';

// AVIF only in production: it encodes slowly.
const heroFormats: ImageFormat[] = production ? ['original', 'webp', 'avif'] : ['original', 'webp'];

/** One of the files written for a source file: what file-changed compares it with. */
const builtPath = ({ file }: { file: Vinyl }): string => {
  if (isFont(file)) {
    return file.relative.replace(/\.\w+$/, '.woff2');
  }

  // The 1280 px original-format copy exists in every mode; AVIF only in production.
  return isHero(file) ? file.relative.replace(/hero(\.\w+)$/, 'hero-1280w$1') : file.relative;
};

/**
 * Images and fonts in one pass, each kind through its own plugin. Encoding is slow, so files unchanged since the
 * last build are skipped, across restarts of the dev server too.
 */
export const assets = (): Promise<void> =>
  pipeline(
    gulp.src(paths.assets.src, { encoding: false }),
    // Before the encoders: a file dropped here is never read by sharp or harfbuzz.
    fileExclude({ patterns: ['*.psd', '.DS_Store'], size: { max: 2 * 1024 * 1024 } }),
    fileChanged({ dest: paths.dist, target: builtPath }),
    conditional({
      handlers: [
        {
          condition: ({ file }) => isHero(file),
          handler: () => imageSqueezer({ formats: heroFormats, widths: [640, 1280] })
        },
        { condition: ({ file }) => isImage(file), handler: () => imageSqueezer({ formats: ['original', 'webp'] }) },
        { condition: ({ file }) => isFont(file), handler: () => fontSwitcher({ formats: ['woff2', 'woff'] }) }
      ]
    }),
    // Email clients do not show WebP or AVIF: email/ gets a copy of the JPEG and PNG images only.
    folderClone({
      dirs: 'email',
      onClone: ({ file, original }) => (isImage(file) && original.relative.startsWith('images') ? file : null)
    }),
    gulp.dest(paths.dist)
  );
