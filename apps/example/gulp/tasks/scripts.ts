import fileConcat from '@zilero/gulp-file-concat';
import jsSqueezer from '@zilero/gulp-js-squeezer';
import textReplace from '@zilero/gulp-text-replace';
import { build } from 'esbuild';
import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { paths, production, version } from '../config.ts';
import { when } from '../utils/when.ts';

/** The app's ES modules, bundled by esbuild: gulp runs the bundler, it does not replace it. */
const app = async (): Promise<void> => {
  await build({
    entryPoints: [paths.scripts.entry],
    outfile: `${paths.scripts.dest}/app.js`,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    minify: production,
    sourcemap: !production,
    logLevel: 'warning'
  });
};

/** Third-party snippets that stay classic scripts: joined in order, filled in, minified in production. */
const vendor = (): Promise<void> =>
  pipeline(
    gulp.src(paths.scripts.vendor, { sourcemaps: !production }),
    fileConcat({ name: 'vendor.js', order: 'polyfills.js' }),
    textReplace({
      rules: [
        { search: '__ANALYTICS_ID__', replace: process.env.ANALYTICS_ID ?? 'G-EXAMPLE' },
        { search: '__VERSION__', replace: version }
      ]
    }),
    when({ condition: production, then: () => jsSqueezer() }),
    gulp.dest(paths.scripts.dest, { sourcemaps: '.' })
  );

export const scripts = gulp.parallel(app, vendor);
