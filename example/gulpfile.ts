import { src, dest, series } from 'gulp';

import GulpArchiveCreator from '@zilero/gulp-archive-creator';
import GulpPugCompiler from '@zilero/gulp-pug-compiler';
import GulpHtmlSqueezer from '@zilero/gulp-html-squeezer';
import GulpRefilename from '@zilero/gulp-refilename';
import GulpJsSqueezer from '@zilero/gulp-js-squeezer';
import GulpFolderClone from '@zilero/gulp-folder-clone';
import GulpFileExclude from '@zilero/gulp-file-exclude';
import GulpConditional from '@zilero/gulp-conditional';

const pugTask = async () => {
  return src('src/**/*.pug')
    .pipe(GulpPugCompiler({
      pugOptions: {
        pretty: true,
      },
    }))
    .pipe(GulpHtmlSqueezer({
      htmlMinifierOptions: {
        collapseWhitespace: true,
      },
    }))
    .pipe(GulpRefilename({
      stem: 'test',
      prefix: 'prefix-',
      suffix: '-suffix',
      dirname: 'dist/custom-folder',
      extname: '.bat',
    }))
    .pipe(dest('dist'));
};

const jsTask = () => {
  return src('src/**/*.js')
    .pipe(GulpJsSqueezer({
      minifyOptions: {
        compress: {
          drop_console: true,
        },
      },
    }))
    .pipe(dest('dist'));
};

const folderCloneTask = () => {
  return src('src/images/**/*')
    .pipe(GulpConditional({
      handlers: [
        {
          condition: () => false,
          handler: () =>  GulpFileExclude({
            patterns: ['1'],
            size: [100, 1000],
          }),
        },
        {
          condition:  () => true,
          handler: () => GulpFileExclude({
            patterns: ['2'],
          }),
        },
      ],
    }))
    .pipe(GulpFolderClone())
    .pipe(dest('dist/images'));
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

const build = series(pugTask, jsTask, folderCloneTask, archiveTask);

/*
 * Export a default task
 */
export default build;
