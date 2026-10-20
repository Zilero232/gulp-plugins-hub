import type { TaskFunction } from 'gulp';

import gulp from 'gulp';
import { rm } from 'node:fs/promises';
import path from 'node:path';

import { paths } from '../config.ts';
import { removeBuilt } from '../utils/remove-built.ts';
import { server } from '../utils/server.ts';
import { assets } from './assets.ts';
import { pages } from './pages.ts';
import { scripts } from './scripts.ts';
import { statics } from './statics.ts';
import { styles } from './styles.ts';

const reload = async (): Promise<void> => {
  server.reload();
};

/** Where a source file of src/ lands in dist/. */
const toDist = (file: string): string => path.join(paths.dist, path.relative(paths.src, file));

/**
 * Serves dist/ with live reload and rebuilds on change; a deleted image, font or static file is removed from dist/
 * too. The watchers are not returned: a task that fails is reported and the next change runs again, instead of the
 * error ending the dev server.
 */
export const serve: TaskFunction = (done) => {
  server.init({ server: paths.dist, open: false, notify: false, ui: false });

  gulp.watch(paths.pages.watch, gulp.series(pages, reload));
  gulp.watch(paths.styles.watch, styles);
  gulp.watch(paths.scripts.watch, gulp.series(scripts, reload));
  gulp.watch(paths.assets.src, gulp.series(assets, reload)).on('unlink', removeBuilt);

  gulp
    .watch(paths.statics.src, gulp.series(statics, reload))
    .on('unlink', (file: string) => rm(toDist(file), { force: true }));

  done();
};
