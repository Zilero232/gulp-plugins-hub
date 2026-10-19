import cssSqueezer from '@zilero/gulp-css-squeezer';
import scssCompiler from '@zilero/gulp-scss-compiler';
import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { paths, production } from '../config.ts';
import { server } from '../utils/server.ts';

/**
 * SCSS to CSS, prefixed and lowered for the browsers in .browserslistrc; minified in production, with source maps
 * in development. The dev server injects the new CSS without a reload.
 */
export const styles = (): Promise<void> =>
  pipeline(
    gulp.src(paths.styles.src, { sourcemaps: !production }),
    scssCompiler(),
    cssSqueezer({ minify: production }),
    gulp.dest(paths.styles.dest, { sourcemaps: '.' }),
    server.stream({ match: '**/*.css' })
  );
