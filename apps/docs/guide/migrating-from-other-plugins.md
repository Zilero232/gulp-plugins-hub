---
description: Replace gulp-sass, gulp-clean-css, gulp-autoprefixer, gulp-terser, gulp-htmlmin, gulp-imagemin, gulp-rev, gulp-zip, gulp-if, gulp-rename, gulp-concat and others with typed gulp 5 plugins, option by option.
---

# Migrating from other plugins

Each plugin here replaces one or more of the plugins a gulp build usually has. The options differ, but the job is the same; this page maps the common cases. Every plugin page ends with a full migration table.

Two things change everywhere:

- **Errors end the task.** No `.on('error', sass.logError)` or `plumber()`: return `pipeline(…)` and an error ends the task with the file and line, while a watcher keeps watching ([why](/guide/gulp-5#return-pipeline-not-a-pipe-chain)).
- **Options are checked when the plugin is created.** An option name carried over from the old plugin fails with `Unrecognized key` instead of being ignored.

## At a glance

| You use                                                                                     | Use instead                                                                | Notes                                                                    |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| gulp-sass, gulp-dart-sass                                                                   | [scss-compiler](/plugins/scss-compiler)                                    | sass-embedded, one compiler per stream; `sassOptions` are Sass's options |
| gulp-clean-css, gulp-cssnano, gulp-autoprefixer, gulp-postcss with autoprefixer and cssnano | [css-squeezer](/plugins/css-squeezer)                                      | Lightning CSS: minify, prefix and lower syntax in one pass               |
| gulp-terser, gulp-uglify                                                                    | [js-squeezer](/plugins/js-squeezer)                                        | terser; `terserOptions`                                                  |
| gulp-htmlmin                                                                                | [html-squeezer](/plugins/html-squeezer)                                    | html-minifier-next, the same option names; a preset by default           |
| gulp-pug                                                                                    | [pug-compiler](/plugins/pug-compiler)                                      | `pugOptions` and `data`                                                  |
| gulp-imagemin, gulp-webp, gulp-avif, gulp-responsive                                        | [image-squeezer](/plugins/image-squeezer)                                  | sharp; formats and widths in one plugin                                  |
| gulp-ttf2woff2, gulp-ttf2woff, gulp-fonter                                                  | [font-switcher](/plugins/font-switcher)                                    | several formats at once, subsetting                                      |
| gulp-rev with gulp-rev-rewrite                                                              | [asset-revision](/plugins/asset-revision)                                  | hashes, rewritten references and the manifest in one pass                |
| gulp-zip, gulp-tar                                                                          | [archive-creator](/plugins/archive-creator)                                | zip, tar and tar.gz                                                      |
| gulp-concat                                                                                 | [file-concat](/plugins/file-concat)                                        | an explicit order, a header and footer                                   |
| gulp-replace, gulp-header, gulp-footer                                                      | [text-replace](/plugins/text-replace)                                      | rules, async replacers, a header and footer                              |
| gulp-rename                                                                                 | [refilename](/plugins/refilename)                                          | `stem` instead of `basename`                                             |
| gulp-if                                                                                     | [conditional](/plugins/conditional)                                        | checked per file, else-if branches                                       |
| gulp-filter                                                                                 | [file-exclude](/plugins/file-exclude), [conditional](/plugins/conditional) | drop files, or send some through other plugins                           |
| gulp-newer, gulp-changed                                                                    | [file-changed](/plugins/file-changed)                                      | by modification time or contents                                         |

## Sass: gulp-sass

```js
// Before
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);

src('src/scss/*.scss')
  .pipe(sass({ outputStyle: 'compressed', includePaths: ['node_modules'] }).on('error', sass.logError))
  .pipe(dest('dist/css'));

// After
import scssCompiler from '@zilero/gulp-scss-compiler';

pipeline(
  src('src/scss/*.scss'),
  scssCompiler({ sassOptions: { style: 'compressed', loadPaths: ['node_modules'] } }),
  dest('dist/css')
);
```

`sassOptions` takes the options of Sass's modern API: `style` instead of `outputStyle`, `loadPaths` instead of `includePaths`. Partials (`_*.scss`) are skipped, and source maps follow `src(…, { sourcemaps: true })`.

## CSS: gulp-clean-css and gulp-autoprefixer

```js
// Before
src('dist/css/*.css')
  .pipe(autoprefixer())
  .pipe(cleanCSS({ level: 2 }))
  .pipe(dest('dist/css'));

// After
import cssSqueezer from '@zilero/gulp-css-squeezer';

pipeline(src('dist/css/*.css'), cssSqueezer(), dest('dist/css'));
```

css-squeezer reads the browsers from `.browserslistrc` (or the `browserslist` key of package.json) like autoprefixer, or from `targets: 'defaults'`. `minify: false` only prefixes and lowers syntax.

## JavaScript: gulp-terser and gulp-uglify

```js
// Before
src('src/js/*.js')
  .pipe(terser({ compress: { drop_console: true }, format: { comments: false } }))
  .pipe(dest('dist/js'));

// After
import jsSqueezer from '@zilero/gulp-js-squeezer';

pipeline(
  src('src/js/*.js'),
  jsSqueezer({ terserOptions: { compress: { drop_console: true }, format: { comments: false } } }),
  dest('dist/js')
);
```

gulp-uglify's `output` is terser's `format`. Source maps are chained to the input's when the file has one.

## HTML: gulp-htmlmin

```js
// Before
src('dist/*.html')
  .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
  .pipe(dest('dist'));

// After
import htmlSqueezer from '@zilero/gulp-html-squeezer';

pipeline(
  src('dist/*.html'),
  htmlSqueezer({ preset: false, htmlMinifierOptions: { collapseWhitespace: true, removeComments: true } }),
  dest('dist')
);
```

html-minifier-next keeps html-minifier's option names. Without `preset: false` the `conservative` preset applies, with your options on top; `preset: 'comprehensive'` also minifies inline CSS, JavaScript and SVG.

## Pug: gulp-pug

```js
// Before
src('src/pages/*.pug')
  .pipe(pug({ pretty: true, data: { year: 2026 } }))
  .pipe(dest('dist'));

// After
import pugCompiler from '@zilero/gulp-pug-compiler';

pipeline(
  src('src/pages/*.pug'),
  pugCompiler({ pugOptions: { pretty: true }, data: ({ file }) => ({ page: file.stem, year: 2026 }) }),
  dest('dist')
);
```

`data` is an object or a function of the file. Files whose name starts with `_` are skipped (`skipPartials`).

## Images: gulp-imagemin, gulp-webp, gulp-responsive

```js
// Before
src('src/images/*')
  .pipe(imagemin([mozjpeg({ quality: 75 }), optipng()]))
  .pipe(dest('dist/images'));
src('src/images/*.jpg').pipe(webp()).pipe(dest('dist/images'));

// After
import imageSqueezer from '@zilero/gulp-image-squeezer';

pipeline(
  src('src/images/*', { encoding: false }),
  imageSqueezer({ formats: ['original', 'webp'], quality: 75, widths: [640, 1280] }),
  dest('dist/images')
);
```

One plugin re-encodes, converts (`webp`, `avif`, `jpeg`, `png`) and resizes (`hero-640w.jpg`, …). SVG and other files it does not read pass through. Read images with `encoding: false`.

## Fonts: gulp-ttf2woff2

```js
// Before
src('src/fonts/*.ttf').pipe(ttf2woff2()).pipe(dest('dist/fonts'));

// After
import fontSwitcher from '@zilero/gulp-font-switcher';

pipeline(
  src('src/fonts/*.{ttf,otf}', { encoding: false }),
  fontSwitcher({ formats: ['woff2', 'woff'] }),
  dest('dist/fonts')
);
```

`subset: 'ABC…'` keeps only the glyphs you use; `keepOriginal: true` emits the source font too.

## Cache-busting: gulp-rev and gulp-rev-rewrite

```js
// Before: two passes and a manifest file between them
src('dist/**/*.{css,js,png,woff2}').pipe(rev()).pipe(dest('dist')).pipe(rev.manifest()).pipe(dest('dist'));
src('dist/**/*.html')
  .pipe(revRewrite({ manifest: readFileSync('dist/rev-manifest.json') }))
  .pipe(dest('dist'));

// After
import assetRevision from '@zilero/gulp-asset-revision';

pipeline(src('dist/**', { encoding: false }), assetRevision({ manifest: true }), dest('release'));
```

One pass hashes the file names, except pages, source maps and the files fetched at fixed URLs such as `robots.txt` and the favicon (`exclude` lists them), rewrites the references in HTML, CSS, JavaScript, SVG, JSON and the other text files, and writes `rev-manifest.json` when `manifest` is set.

## Archives: gulp-zip

```js
// Before
src('dist/**').pipe(zip('site.zip')).pipe(dest('release'));

// After
import archiveCreator from '@zilero/gulp-archive-creator';

pipeline(src('dist/**', { encoding: false }), archiveCreator({ name: 'site.zip' }), dest('release'));
```

The extension of `name` picks the format: `.zip`, `.tar`, `.tgz` or `.tar.gz`.

## Joining files: gulp-concat

```js
// Before
src(['src/js/polyfills.js', 'src/js/*.js'])
  .pipe(concat('vendor.js', { newLine: ';\n' }))
  .pipe(dest('dist/js'));

// After
import fileConcat from '@zilero/gulp-file-concat';

pipeline(
  src('src/js/*.js'),
  fileConcat({ name: 'vendor.js', order: 'polyfills.js', separator: ';\n' }),
  dest('dist/js')
);
```

Gulp 5 does not keep the order of the globs given to `src`, so the order goes in `order`.

## Replacing text: gulp-replace

```js
// Before
src('dist/js/*.js')
  .pipe(replace('__VERSION__', version))
  .pipe(replace(/console\.log\(.*?\);?/g, ''))
  .pipe(dest('dist/js'));

// After
import textReplace from '@zilero/gulp-text-replace';

pipeline(
  src('dist/js/*.js'),
  textReplace({
    rules: [
      { search: '__VERSION__', replace: version },
      { search: /console\.log\(.*?\);?/g, replace: '' }
    ]
  }),
  dest('dist/js')
);
```

A string matches everywhere it occurs, as in gulp-replace. A replacer function gets one object, `({ match, groups, namedGroups, file })`, and may be async. `header` and `footer` replace gulp-header and gulp-footer.

## Renaming: gulp-rename

```js
// Before
src('dist/js/app.js')
  .pipe(rename({ basename: 'bundle', suffix: '.min' }))
  .pipe(dest('dist/js'));
src('dist/js/*.js')
  .pipe(
    rename((path) => {
      path.dirname = 'scripts';
    })
  )
  .pipe(dest('dist'));

// After
import refilename from '@zilero/gulp-refilename';

pipeline(src('dist/js/app.js'), refilename({ stem: 'bundle', suffix: '.min' }), dest('dist/js'));
pipeline(
  src('dist/js/*.js'),
  refilename(({ parts }) => {
    parts.dirname = 'scripts';
  }),
  dest('dist')
);
```

`basename` is `stem`; `prefix`, `suffix`, `extname` and `dirname` keep their names. A function gets `{ parts, file }` and changes `parts` or returns the changes; a string is the new file name.

## Conditions: gulp-if

```js
// Before
src('src/js/*.js').pipe(gulpif(production, terser())).pipe(dest('dist/js'));
src('src/**')
  .pipe(gulpif('*.css', cleanCSS(), gulpif('*.js', terser())))
  .pipe(dest('dist'));

// After
import conditional from '@zilero/gulp-conditional';

pipeline(
  src('src/**'),
  conditional({
    handlers: [
      { condition: '*.css', handler: () => cssSqueezer() },
      { condition: ({ file }) => file.extname === '.js', handler: () => jsSqueezer() }
    ]
  }),
  dest('dist')
);
```

The condition is checked for every file: a boolean, a glob or RegExp against `file.relative`, or a function of the file. The first branch that matches gets the file, the others pass through untouched (or go to `defaultHandler`, the else branch); a handler is created on first use and may return several plugins in an array. For a single condition that is the same for every file, a plain `production ? jsSqueezer() : new PassThrough({ objectMode: true })` is enough ([recipe](/guide/recipes#a-step-in-one-mode-only)).

## Filtering: gulp-filter

```js
// Before
src('dist/**')
  .pipe(filter(['**', '!**/*.map']))
  .pipe(dest('release'));

// After
import fileExclude from '@zilero/gulp-file-exclude';

pipeline(src('dist/**', { encoding: false }), fileExclude({ patterns: '*.map' }), dest('release'));
```

A glob without a slash matches the file name in any folder. file-exclude also drops by `size: { min, max }` or your own `exclude` function. gulp-filter's `restore` (send some files through a plugin, keep the rest) is [conditional](/plugins/conditional) with a glob condition.

## Changed files: gulp-newer and gulp-changed

```js
// Before
src('src/images/*.jpg').pipe(newer('dist/images')).pipe(imagemin()).pipe(dest('dist/images'));
src('src/static/**')
  .pipe(changed('dist', { hasChanged: changed.compareContents }))
  .pipe(dest('dist'));

// After
import fileChanged from '@zilero/gulp-file-changed';

pipeline(
  src('src/images/*.jpg', { encoding: false }),
  fileChanged({ dest: 'dist/images' }),
  imageSqueezer(),
  dest('dist/images')
);
pipeline(src('src/static/**', { encoding: false }), fileChanged({ dest: 'dist', compare: 'contents' }), dest('dist'));
```

`compare: 'contents'` is gulp-changed's `compareContents`. `extname` replaces `extension` (gulp-changed) and `ext` (gulp-newer), for builds that change the extension; `target` maps a source to its built path when the build renames it in other ways (gulp-newer's `map`).
