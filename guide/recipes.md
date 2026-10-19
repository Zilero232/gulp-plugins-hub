---
url: /gulp-plugins-hub/guide/recipes.md
---
# Recipes

## A complete site build

The [example](https://github.com/Zilero232/gulp-plugins-hub/tree/master/apps/example) in the repository is a static site built with every plugin, set up the way a gulp 5 build is in 2026 (TypeScript gulpfile through esbuild-register); CI runs it on the published builds. Its shape:

```text
apps/example/
├── gulpfile.ts          the public tasks: build, release, clean and the default dev task
├── .browserslistrc      the browsers css-squeezer prefixes for
└── gulp/
    ├── config.ts        paths, the --production flag, the version
    ├── tasks/           one task per file: pages, styles, scripts, assets, statics, revision, archive, serve
    └── utils/           the dev server, a `when` helper for steps that run in one mode only
```

```sh
npx gulp                       # build, serve with live reload, rebuild on change
npx gulp build --production    # minified, no source maps, AVIF images
npx gulp release --production  # plus hashed asset names in release/site/ and release/site-v1.0.0.zip
npx gulp --tasks               # the tasks with their descriptions
```

### Configuration

```ts
// gulp/config.ts
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { production: { type: 'boolean', default: false } }, strict: false });

export const production = values.production === true || process.env.NODE_ENV === 'production';
```

### Pages

```ts
export const pages = () =>
  pipeline(
    src('src/pages/**/*.pug'),
    pugCompiler({
      pugOptions: { basedir: 'src', pretty: !production }, // `extends /templates/_layout.pug` resolves from src/
      data: ({ file }) => ({ page: file.stem, year: new Date().getFullYear() })
    }),
    when({ condition: production, then: () => htmlSqueezer({ preset: 'comprehensive' }) }),
    dest('dist')
  );
```

### Styles, with source maps in development

```ts
export const styles = () =>
  pipeline(
    src('src/scss/**/*.scss', { sourcemaps: !production }),
    scssCompiler(), // partials (_*.scss) are skipped
    cssSqueezer({ minify: production }), // prefixes for .browserslistrc
    dest('dist/css', { sourcemaps: '.' }),
    server.stream({ match: '**/*.css' }) // browser-sync injects the CSS without a reload
  );
```

### Scripts

Bundle the application's modules with a bundler, called from the task; keep gulp plugins for what bundlers do not do:

```ts
const app = () =>
  esbuild.build({ entryPoints: ['src/js/main.js'], outfile: 'dist/js/app.js', bundle: true, minify: production });

// Third-party snippets that stay classic scripts: joined in order, filled in, minified.
const vendor = () =>
  pipeline(
    src('src/js/vendor/*.js'),
    fileConcat({ name: 'vendor.js', order: 'polyfills.js' }),
    textReplace({ rules: { search: '__ANALYTICS_ID__', replace: process.env.ANALYTICS_ID ?? 'G-EXAMPLE' } }),
    when({ condition: production, then: () => jsSqueezer() }),
    dest('dist/js')
  );

export const scripts = parallel(app, vendor);
```

### Images and fonts in one task

```ts
export const assets = () =>
  pipeline(
    src('src/{images,fonts}/**', { encoding: false }),
    fileChanged({ dest: 'dist', target: builtPath }), // encoding is slow: skip what did not change
    conditional({
      handlers: [
        { condition: ({ file }) => isImage(file), handler: () => imageSqueezer({ formats: ['original', 'webp'] }) },
        { condition: ({ file }) => isFont(file), handler: () => fontSwitcher({ formats: ['woff2', 'woff'] }) }
      ]
    }),
    dest('dist')
  );
```

### Release: hashed names and a zip

```ts
const revision = () =>
  pipeline(
    src('dist/**', { encoding: false }),
    assetRevision({ exclude: ['*.html', '*.map', 'robots.txt'], manifest: true }),
    dest('release/site')
  );

const archive = () =>
  pipeline(
    src('release/site/**', { encoding: false }),
    archiveCreator({ name: 'site.zip' }),
    refilename({ suffix: `-v${version}` }),
    dest('release')
  );

export const release = series(build, revision, archive);
```

### Dev server

```ts
export const serve = (done) => {
  server.init({ server: 'dist', open: false });

  watch('src/**/*.pug', series(pages, reload));
  watch('src/scss/**', styles);
  watch('src/static/**', series(statics, reload)).on('unlink', (file) => rm(toDist(file), { force: true }));

  done(); // the watchers are not returned: a failing task is reported, and the next change runs it again
};
```

## Incremental builds

* **In one watch session**, `src(globs, { since: lastRun(task) })` reads only the files changed since the task last ran. It suits tasks that copy files one to one.
* **Across runs** (restarting the dev server, running `gulp images` again), [file-changed](/plugins/file-changed) compares with what is already in the output folder. It suits slow work such as image and font encoding.
* Neither suits Sass, Pug or bundles, whose files depend on each other: rebuild their entry points.

## Responsive images

```js
src('src/images/photos/*.jpg', { encoding: false })
  .pipe(imageSqueezer({ formats: ['original', 'webp', 'avif'], widths: [480, 960, 1920] }))
  .pipe(dest('dist/images/photos'));
```

```html
<picture>
  <source type="image/avif" srcset="/images/photos/beach-480w.avif 480w, /images/photos/beach-960w.avif 960w" />
  <source type="image/webp" srcset="/images/photos/beach-480w.webp 480w, /images/photos/beach-960w.webp 960w" />
  <img src="/images/photos/beach-960w.jpg" srcset="/images/photos/beach-480w.jpg 480w" alt="" />
</picture>
```

## Only the glyphs a page needs

```js
src('src/fonts/Display.ttf', { encoding: false })
  .pipe(fontSwitcher({ formats: 'woff2', subset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' }))
  .pipe(dest('dist/fonts'));
```

## A step in one mode only

Plugins are plain functions, so a JavaScript condition decides when the whole stream takes the same path:

```ts
import { PassThrough } from 'node:stream';

const when = ({ condition, then }) => (condition ? then() : new PassThrough({ objectMode: true }));
```

Use [conditional](/plugins/conditional) when the decision depends on each file.
