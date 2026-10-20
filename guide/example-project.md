---
url: /gulp-plugins-hub/guide/example-project.md
description: >-
  A complete static site built with every gulp-plugins-hub plugin, set up the
  way a gulp 5 build is in 2026, with its task tree and how to run it.
---

# Example project

[`apps/example`](https://github.com/Zilero232/gulp-plugins-hub/tree/master/apps/example) is a static site built with every plugin: Pug pages, SCSS, an esbuild bundle and classic vendor scripts, responsive images, web fonts, hashed asset names and a zipped release. It is set up the way a gulp 5 build is in 2026: a TypeScript gulpfile loaded by esbuild-register, one task per file, `pipeline` everywhere and a browser-sync dev server.

CI builds it on every pull request from the packages' built `dist/` files, as a user would install them, and checks the output.

## Run it

From a clone of the repository:

```sh
bun install
bun run example             # builds the packages, then the site (gulp build --production)

cd apps/example
bunx gulp                   # build, serve with live reload, rebuild on change
bunx gulp build             # development build: readable output with source maps
bunx gulp build --production
bunx gulp release           # production build, hashed names in release/site/, release/site-v1.0.0.zip
bunx gulp --tasks           # the task tree below
```

`gulp release` always builds for production. `NODE_ENV=production` switches every task to production too, and `ANALYTICS_ID` fills in the measurement id of the analytics snippet.

## Layout

```text
apps/example/
├── gulpfile.ts          the public tasks: build, release, clean and the default dev task
├── .browserslistrc      the browsers css-squeezer prefixes and lowers syntax for
├── gulp/
│   ├── config.ts        paths, the production mode, the version from package.json
│   ├── tasks/           one task per file: pages, styles, scripts, assets, statics, revision, archive, serve, clean
│   └── utils/           the dev server, `when` for steps that run in one mode only, cleanup of deleted assets
├── src/
│   ├── pages/           Pug pages; templates/ has the layout they extend
│   ├── scss/            main.scss and its partials in config/, base/, components/, layout/
│   ├── js/              main.js and its modules (bundled), vendor/ (classic scripts)
│   ├── images/, fonts/  encoded and converted by the assets task
│   └── static/          copied as they are
└── test/                checks the output of `gulp release`
```

## Tasks

```text
├─┬ build    Build the site into dist/ (add --production for minified output)
│ └─┬ <series>
│   ├── clean
│   └─┬ <parallel>
│     ├── pages
│     ├── styles
│     ├─┬ <parallel>
│     │ ├── app
│     │ └── vendor
│     ├── assets
│     └── statics
├── clean    Remove dist/ and release/
├─┬ default  Build, serve with live reload and rebuild on change
│ └─┬ <series>
│   ├─┬ <parallel>  (pages, styles, scripts, assets, statics)
│   └── serve
└─┬ release  Build for production, hash the asset names into release/site/ and zip it
  └─┬ <series>
    ├── build
    ├── revision
    └── archive
```

| Task       | Plugins                                                                                                                                                                                                                                      | Output                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `pages`    | [pug-compiler](/plugins/pug-compiler), [html-squeezer](/plugins/html-squeezer) in production                                                                                                                                                 | `dist/*.html`                                                       |
| `styles`   | [scss-compiler](/plugins/scss-compiler), [css-squeezer](/plugins/css-squeezer)                                                                                                                                                               | `dist/css/main.css`, a source map in development                    |
| `app`      | esbuild, called from the task                                                                                                                                                                                                                | `dist/js/app.js`                                                    |
| `vendor`   | [file-concat](/plugins/file-concat), [text-replace](/plugins/text-replace), [js-squeezer](/plugins/js-squeezer) in production                                                                                                                | `dist/js/vendor.js`                                                 |
| `assets`   | [file-exclude](/plugins/file-exclude), [file-changed](/plugins/file-changed), [conditional](/plugins/conditional), [image-squeezer](/plugins/image-squeezer), [font-switcher](/plugins/font-switcher), [folder-clone](/plugins/folder-clone) | WebP and AVIF images at two widths, woff2 and woff, `email/` copies |
| `statics`  | none: `src` and `dest` with `since: lastRun(statics)`                                                                                                                                                                                        | `robots.txt`, `favicon.svg`                                         |
| `revision` | [asset-revision](/plugins/asset-revision)                                                                                                                                                                                                    | `release/site/` with hashed names and `rev-manifest.json`           |
| `archive`  | [archive-creator](/plugins/archive-creator), [refilename](/plugins/refilename)                                                                                                                                                               | `release/site-v1.0.0.zip`                                           |

## The code

### Configuration

The mode is read once, when the gulpfile loads. gulp-cli has parsed the command line already, so `parseArgs` with `strict: false` only picks out the flag and the task names:

```ts
// gulp/config.ts
import { parseArgs } from 'node:util';

import packageJson from '../package.json' with { type: 'json' };

const { values, positionals } = parseArgs({
  options: { production: { type: 'boolean', default: false } },
  strict: false
});

export const production =
  values.production === true || process.env.NODE_ENV === 'production' || positionals.includes('release');

export const { version } = packageJson;
```

### Pages

```ts
export const pages = (): Promise<void> =>
  pipeline(
    gulp.src('src/pages/**/*.pug'),
    pugCompiler({
      pugOptions: { basedir: 'src', pretty: !production }, // `extends /templates/_layout.pug` resolves from src/
      data: ({ file }) => ({ page: file.stem, year: new Date().getFullYear(), version, production })
    }),
    when({ condition: production, then: () => htmlSqueezer({ preset: 'comprehensive' }) }),
    gulp.dest('dist')
  );
```

### Styles, with source maps in development

```ts
export const styles = (): Promise<void> =>
  pipeline(
    gulp.src('src/scss/*.scss', { sourcemaps: !production }), // the entry files; partials come in through @use
    scssCompiler(),
    cssSqueezer({ minify: production }), // prefixes and lowers syntax for .browserslistrc
    gulp.dest('dist/css', { sourcemaps: '.' }),
    // While the dev server runs, browser-sync injects the new CSS without a reload.
    when({ condition: server.active, then: () => server.stream({ match: '**/*.css' }) })
  );
```

### Scripts

The application's modules go through a bundler, called from the task; gulp plugins handle what bundlers do not:

```ts
const app = async (): Promise<void> => {
  await build({ entryPoints: ['src/js/main.js'], outfile: 'dist/js/app.js', bundle: true, minify: production });
};

// Third-party snippets that stay classic scripts: joined in order, filled in, minified in production.
const vendor = (): Promise<void> =>
  pipeline(
    gulp.src('src/js/vendor/*.js', { sourcemaps: !production }),
    fileConcat({ name: 'vendor.js', order: 'polyfills.js' }),
    textReplace({
      rules: [
        { search: '__ANALYTICS_ID__', replace: process.env.ANALYTICS_ID ?? 'G-EXAMPLE' },
        { search: '__VERSION__', replace: version }
      ]
    }),
    when({ condition: production, then: () => jsSqueezer() }),
    gulp.dest('dist/js', { sourcemaps: '.' })
  );

export const scripts = gulp.parallel(app, vendor);
```

### Images and fonts in one task

Encoding is the slow part, so everything that can drop a file runs first: file-exclude, then file-changed, which skips the files whose output in `dist/` is newer, across restarts of the dev server too.

```ts
export const assets = (): Promise<void> =>
  pipeline(
    gulp.src('src/{images,fonts}/**', { encoding: false }),
    fileExclude({ patterns: ['*.psd', '.DS_Store'], size: { max: 2 * 1024 * 1024 } }),
    fileChanged({ dest: 'dist', target: builtPath }), // builtPath: one of the files written for the source
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
    gulp.dest('dist')
  );
```

### Release: hashed names and a zip

```ts
const revision = (): Promise<void> =>
  pipeline(
    gulp.src('dist/**', { encoding: false }),
    assetRevision({ exclude: ['*.html', '*.map', 'robots.txt'], manifest: true }), // robots.txt keeps its name
    gulp.dest('release/site')
  );

const archive = (): Promise<void> =>
  pipeline(
    gulp.src('release/site/**', { encoding: false }),
    archiveCreator({ name: 'site.zip' }),
    refilename({ suffix: `-v${version}` }),
    gulp.dest('release')
  );

export const release = gulp.series(build, revision, archive);
```

### Dev server

The watchers are not returned: a failing task is reported, and the next change runs it again. A deleted source is removed from `dist/` too: a static file directly, an image or font with every format and width built from it.

```ts
export const serve: TaskFunction = (done) => {
  server.init({ server: 'dist', open: false, notify: false, ui: false });

  gulp.watch('src/**/*.pug', gulp.series(pages, reload));
  gulp.watch('src/scss/**', styles);
  gulp.watch('src/js/**', gulp.series(scripts, reload));
  gulp.watch('src/{images,fonts}/**', gulp.series(assets, reload)).on('unlink', removeBuilt);
  gulp.watch('src/static/**', gulp.series(statics, reload)).on('unlink', (file) => rm(toDist(file), { force: true }));

  done();
};
```

## What the test checks

`bun run test` in `apps/example` runs `gulp release`, then [`test/release.test.ts`](https://github.com/Zilero232/gulp-plugins-hub/blob/master/apps/example/test/release.test.ts): minified pages with their data, prefixed CSS without source maps, the esbuild bundle, the vendor scripts in order, woff2 fonts that keep their OpenType tables, WebP and AVIF images at both widths, the `email/` copies, the hashed names with every reference rewritten, and the zip.
