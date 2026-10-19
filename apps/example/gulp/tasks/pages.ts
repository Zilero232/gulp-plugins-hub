import htmlSqueezer from '@zilero/gulp-html-squeezer';
import pugCompiler from '@zilero/gulp-pug-compiler';
import gulp from 'gulp';
import { pipeline } from 'node:stream/promises';

import { navigation, paths, production, version } from '../config.ts';
import { when } from '../utils/when.ts';

/** Pug pages to HTML, with data for each page; minified in production. */
export const pages = (): Promise<void> =>
  pipeline(
    gulp.src(paths.pages.src),
    pugCompiler({
      // Absolute includes (`extends /templates/_layout.pug`) resolve from src/, not from the pages folder.
      pugOptions: { basedir: paths.src, pretty: !production },
      data: ({ file }) => ({
        page: file.stem,
        title: navigation.find(({ page }) => page === file.stem)?.label ?? file.stem,
        navigation,
        year: new Date().getFullYear(),
        version,
        production
      })
    }),
    when({ condition: production, then: () => htmlSqueezer({ preset: 'comprehensive' }) }),
    gulp.dest(paths.dist)
  );
