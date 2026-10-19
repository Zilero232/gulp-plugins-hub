import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { paths } from '../config.ts';

/** Files copied as they are; in watch mode, only the ones changed since the last run. */
export const statics = (): Promise<void> =>
  pipeline(gulp.src(paths.statics.src, { encoding: false, since: gulp.lastRun(statics) }), gulp.dest(paths.dist));
