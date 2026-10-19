import assetRevision from '@zilero/gulp-asset-revision';
import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { paths } from '../config.ts';

/** Hashed names for long-term caching, the references rewritten, and a manifest. */
export const revision = (): Promise<void> =>
  pipeline(
    gulp.src(`${paths.dist}/**`, { encoding: false }),
    // robots.txt has to keep its name, like the pages and source maps excluded by default.
    assetRevision({ exclude: ['*.html', '*.map', 'robots.txt'], manifest: true }),
    gulp.dest(`${paths.release}/site`)
  );
