import archiveCreator from '@zilero/gulp-archive-creator';
import refilename from '@zilero/gulp-refilename';
import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { paths, version } from '../config.ts';

/** The revised site in one versioned zip. */
export const archive = (): Promise<void> =>
  pipeline(
    gulp.src(`${paths.release}/site/**`, { encoding: false }),
    archiveCreator({ name: 'site.zip' }),
    refilename({ suffix: `-v${version}` }),
    gulp.dest(paths.release)
  );
