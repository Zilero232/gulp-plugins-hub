import { src, dest, series } from 'gulp';

import GulpArchiveCreator from '@zilero/gulp-archive-creator';
import GulpPugCompiler from '@zilero/gulp-pug-compiler';
import GulpHtmlSqueezer from '@zilero/gulp-html-squeezer';
import GulpRefilename from '@zilero/gulp-refilename';

const pugTask = () => {
  return src('src/**/*.pug')
    .pipe(GulpPugCompiler({
      pugOptions: {
        pretty: true,
      }
    }))
    .pipe(GulpHtmlSqueezer({
      htmlMinifierOptions: {
        collapseWhitespace: true,
      },
    }))
    .pipe(GulpRefilename({
      basename: 'test',
      prefix: 'test-',
      suffix: '-test',
    }))
    .pipe(dest('dist'));
};

const archiveTask = () => {
  return src('src/**/*.*')
    .pipe(GulpArchiveCreator({
      format: 'tar',
      pluginOptions: {
        archiveName: 'example2',
        logFinal: true,
      }
    }))
    .pipe(dest('dist'));
};

const build = series(pugTask, archiveTask);

/*
 * Export a default task
 */
export default build;
